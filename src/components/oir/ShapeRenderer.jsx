import React from 'react';

const ShapeRenderer = ({ shape, size = 50, className = '' }) => {
  // Safety check for shape object
  if (!shape || typeof shape !== 'object') {
    return (
      <div className={`inline-block ${className}`}>
        <div 
          style={{ width: size, height: size }}
          className="flex items-center justify-center bg-red-100 border border-red-300 rounded text-red-500 text-xs"
        >
          Invalid Shape
        </div>
      </div>
    );
  }

  // Provide default values for missing properties
  const safeShape = {
    shape: shape.shape || 'circle',
    size: shape.size || 'medium',
    fill: shape.fill || 'none',
    rotation: shape.rotation || 0
  };
  const getSizeValue = (sizeStr) => {
    switch (sizeStr) {
      case 'small': return size * 0.7;
      case 'medium': return size;
      case 'large': return size * 1.3;
      default: return size;
    }
  };

  const getStrokePattern = (fill) => {
    if (fill === 'striped') {
      return 'url(#stripPattern)';
    }
    return 'none';
  };

  const getFillColor = (fill) => {
    switch (fill) {
      case 'filled': return '#3b82f6';
      case 'striped': return 'url(#stripPattern)';
      case 'none':
      default: return 'transparent';
    }
  };

  const actualSize = getSizeValue(safeShape.size);
  const strokeWidth = 2;

  const renderShape = () => {
    const commonProps = {
      fill: getFillColor(safeShape.fill),
      stroke: '#374151',
      strokeWidth: strokeWidth,
      transform: `rotate(${safeShape.rotation || 0})`
    };

    switch (safeShape.shape) {
      case 'circle':
        return (
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={actualSize / 2 - strokeWidth}
            {...commonProps}
          />
        );

      case 'square':
        return (
          <rect
            x={strokeWidth}
            y={strokeWidth}
            width={actualSize - strokeWidth * 2}
            height={actualSize - strokeWidth * 2}
            {...commonProps}
            transformOrigin={`${actualSize / 2} ${actualSize / 2}`}
          />
        );

      case 'rectangle':
        const rectWidth = actualSize;
        const rectHeight = actualSize * 0.6;
        return (
          <rect
            x={strokeWidth}
            y={(actualSize - rectHeight) / 2}
            width={rectWidth - strokeWidth * 2}
            height={rectHeight}
            {...commonProps}
            transformOrigin={`${actualSize / 2} ${actualSize / 2}`}
          />
        );

      case 'triangle':
        const trianglePoints = [
          [actualSize / 2, strokeWidth],
          [actualSize - strokeWidth, actualSize - strokeWidth],
          [strokeWidth, actualSize - strokeWidth]
        ].map(point => point.join(',')).join(' ');
        
        return (
          <polygon
            points={trianglePoints}
            {...commonProps}
            transformOrigin={`${actualSize / 2} ${actualSize / 2}`}
          />
        );

      case 'pentagon':
        const centerX = actualSize / 2;
        const centerY = actualSize / 2;
        const radius = actualSize / 2 - strokeWidth;
        const angle = (2 * Math.PI) / 5;
        
        const pentagonPoints = Array.from({ length: 5 }, (_, i) => {
          const x = centerX + radius * Math.cos(i * angle - Math.PI / 2);
          const y = centerY + radius * Math.sin(i * angle - Math.PI / 2);
          return `${x},${y}`;
        }).join(' ');

        return (
          <polygon
            points={pentagonPoints}
            {...commonProps}
            transformOrigin={`${centerX} ${centerY}`}
          />
        );

      default:
        console.warn('Unknown shape type:', safeShape.shape);
        return (
          <rect
            x={strokeWidth}
            y={strokeWidth}
            width={actualSize - strokeWidth * 2}
            height={actualSize - strokeWidth * 2}
            fill="#fef2f2"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        width={actualSize} 
        height={actualSize} 
        viewBox={`0 0 ${actualSize} ${actualSize}`}
        className="border border-gray-200 rounded"
      >
        {/* Define stripe pattern */}
        <defs>
          <pattern 
            id="stripPattern" 
            patternUnits="userSpaceOnUse" 
            width="8" 
            height="8"
            patternTransform="rotate(45)"
          >
            <rect width="4" height="8" fill="#3b82f6" />
            <rect x="4" width="4" height="8" fill="transparent" />
          </pattern>
        </defs>
        {renderShape()}
      </svg>
    </div>
  );
};

export default ShapeRenderer;