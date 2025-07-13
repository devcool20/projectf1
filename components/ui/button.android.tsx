import React, { FC } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ButtonProps } from './button.types.android';
import { buttonStyles, textStyles } from './button.styles.android';

export const Button: FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  disabled = false,
  style,
  ...props 
}) => {
  const getButtonStyle = () => {
    const sizeKey = size === 'default' ? 'default_size' : size;
    return [
      buttonStyles.base,
      buttonStyles[variant],
      buttonStyles[sizeKey],
      disabled && buttonStyles.disabled,
      style,
    ];
  };

  const getTextStyle = () => {
    return [
      textStyles.base,
      textStyles[variant],
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      disabled={disabled}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={getTextStyle()}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}; 