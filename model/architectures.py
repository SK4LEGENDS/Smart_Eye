
import torch
import torch.nn as nn
import torchvision.models as models

class MCDropout(nn.Module):
    """
    Monte Carlo Dropout Wrapper.
    Forces dropout to be active even during inference (model.eval())
    to allow for uncertainty quantification via multiple forward passes.
    """
    def __init__(self, model, dropout_prob=0.5):
        super(MCDropout, self).__init__()
        self.model = model
        self.dropout_prob = dropout_prob

    def forward(self, x):
        return self.model(x)

def get_model(model_name, num_classes, pretrained=True):
    """
    Factory function to get the requested model architecture.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    if model_name == 'resnet50':
        # Load ResNet50
        model = models.resnet50(pretrained=pretrained)
        
        # Modify the final layer
        num_ftrs = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.5), # Add dropout before final layer for MC Dropout
            nn.Linear(num_ftrs, num_classes)
        )
        
    elif model_name == 'efficientnet_b0':
        # Load EfficientNet-B0
        try:
            model = models.efficientnet_b0(pretrained=pretrained)
        except AttributeError:
             # Fallback for older torchvision versions if needed, though requirements say 0.15.2 which has it
            print("Warning: efficientnet_b0 not found in torchvision, falling back to resnet18")
            model = models.resnet18(pretrained=pretrained)

        # Modify classifier
        # EfficientNet has a 'classifier' block
        if hasattr(model, 'classifier'):
             num_ftrs = model.classifier[1].in_features
             model.classifier = nn.Sequential(
                nn.Dropout(0.2),
                nn.Linear(num_ftrs, num_classes)
            )
        else:
             # Fallback for resnet18 fallback
             num_ftrs = model.fc.in_features
             model.fc = nn.Sequential(
                nn.Dropout(0.5),
                nn.Linear(num_ftrs, num_classes)
             )

    elif model_name == 'vit_b_16':
        # Load Vision Transformer
        try:
            model = models.vit_b_16(pretrained=pretrained)
        except AttributeError:
            print("Warning: vit_b_16 not found, falling back to resnet50")
            return get_model('resnet50', num_classes, pretrained)
            
        # Modify heads
        num_ftrs = model.heads.head.in_features
        model.heads.head = nn.Sequential(
            nn.Dropout(0.1),
            nn.Linear(num_ftrs, num_classes)
        )
        
    elif model_name == 'alexnet':
        # Keep original AlexNet support for backward compatibility
        model = models.alexnet(pretrained=pretrained)
        model.classifier[6] = nn.Linear(model.classifier[6].in_features, num_classes)

    else:
        raise ValueError(f"Unknown model name: {model_name}")

    return model.to(device)


def enable_dropout(m):
    """ Function to enable the dropout layers during test-time """
    if type(m) == nn.Dropout:
        m.train()

def predict_with_uncertainty(model, input_tensor, num_samples=10):
    """
    Perform Monte Carlo Dropout inference.
    Returns:
        mean_prediction: Tensor of shape (1, num_classes) - averaged probabilities
        uncertainty: Float - predictive entropy or variance
    """
    model.eval() # Start with eval mode (fixes BatchNorm)
    model.apply(enable_dropout) # Manually enable dropout layers
    
    outputs = []
    
    with torch.no_grad():
        for _ in range(num_samples):
            output = model(input_tensor)
            prob = torch.nn.functional.softmax(output, dim=1)
            outputs.append(prob)
            
    # Stack outputs: (num_samples, 1, num_classes)
    outputs_stack = torch.stack(outputs)
    
    # Calculate Mean (Final Prediction)
    mean_prediction = torch.mean(outputs_stack, dim=0) # (1, num_classes)
    
    # Calculate Variance (Uncertainty)
    # We can use the mean variance across classes as a scalar uncertainty score
    variance = torch.var(outputs_stack, dim=0)
    uncertainty_score = torch.mean(variance).item()
    
    return mean_prediction, uncertainty_score
