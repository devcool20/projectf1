import React, { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';

// Import a sample map for testing
// In a real app, we would map circuit IDs to these files
const bahrainGeo = require('../../assets/f1-maps/f1-circuits-master/circuits/bh-2002.json');

interface CircuitMapProps {
  circuitId?: string; // Future use
}

export function CircuitMap({ circuitId }: CircuitMapProps) {
  // For now, we just use the Bahrain map as a placeholder/experiment
  const geoJson = bahrainGeo;

  const pathData = useMemo(() => {
    if (!geoJson || !geoJson.features || !geoJson.features[0]) return '';

    const coordinates = geoJson.features[0].geometry.coordinates;
    if (!coordinates || coordinates.length === 0) return '';

    // 1. Find bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    coordinates.forEach((coord: number[]) => {
      const [x, y] = coord; // lon, lat
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    // 2. Scale to fit SVG
    // We want to fit into a 200x150 box (or whatever the viewbox is)
    // But we want to preserve aspect ratio.
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Aspect ratio of the track
    const trackAspect = width / height;
    
    // Target dimensions
    const targetWidth = 200;
    const targetHeight = 150;
    const targetAspect = targetWidth / targetHeight;

    let scaleX, scaleY;
    let offsetX, offsetY;

    // To preserve aspect ratio, we scale by the dimension that is "limiting"
    // Note: Latitude (y) is inverted in SVG (y goes down), so we need to flip y.
    
    // Simple linear projection (sufficient for small areas like circuits)
    // x' = (x - minX) * scale
    // y' = (maxY - y) * scale  <-- flip Y because SVG y=0 is top

    if (trackAspect > targetAspect) {
      // Track is wider than target: fit to width
      const scale = (targetWidth - 20) / width; // 20px padding
      scaleX = scale;
      scaleY = scale;
      offsetX = 10; // padding
      offsetY = (targetHeight - (height * scale)) / 2;
    } else {
      // Track is taller than target: fit to height
      const scale = (targetHeight - 20) / height; // 20px padding
      scaleX = scale;
      scaleY = scale;
      offsetX = (targetWidth - (width * scale)) / 2;
      offsetY = 10; // padding
    }

    // 3. Generate path
    return coordinates.map((coord: number[], index: number) => {
      const [x, y] = coord;
      const svgX = (x - minX) * scaleX + offsetX;
      const svgY = (maxY - y) * scaleY + offsetY; // Flip Y
      return `${index === 0 ? 'M' : 'L'}${svgX},${svgY}`;
    }).join(' ') + 'Z';

  }, [geoJson]);

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 200 150">
        {/* Glow effect */}
        <Path
          d={pathData}
          fill="none"
          stroke="rgba(220, 38, 38, 0.3)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main line */}
        <Path
          d={pathData}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
