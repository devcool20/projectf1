import React from 'react';
import { View, Text } from 'react-native';

const Y_AXIS_INTERVALS = [25, 20, 15, 10, 5, 0];
const CHART_HEIGHT = 120;
const X_LABEL_HEIGHT = 16;
const BASELINE_OFFSET = -2; // Final tweak for perfect alignment

const DriverPointsBarChart = ({ pointsData, teamColor }) => {
  const maxPoints = 25; // F1 max points per race
  const barCount = pointsData.length;
  const chartPadding = 28 + 2; // Y-axis width + marginRight

  return (
    <View style={{ width: '100%', position: 'relative', height: CHART_HEIGHT + X_LABEL_HEIGHT * 2 + 10 + BASELINE_OFFSET }}>
      {/* Y-axis and grid lines (absolute positioning) */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: 28, height: CHART_HEIGHT }}>
        {Y_AXIS_INTERVALS.map((val, idx) => {
          // Use Math.round for pixel-perfect alignment
          const top = Math.round((1 - val / maxPoints) * CHART_HEIGHT);
          return (
            <View key={idx} style={{ position: 'absolute', left: 0, right: 0, top }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ color: '#fff', fontSize: 10, opacity: 0.7, width: 18, textAlign: 'right', lineHeight: 12 }}>{val}</Text>
                {/* Grid line */}
                <View style={{ height: 1, backgroundColor: '#fff', opacity: 0.08, flex: 1, marginLeft: 4 }} />
              </View>
            </View>
          );
        })}
      </View>
      {/* Bar chart and round numbers, absolutely positioned at the bottom */}
      <View style={{ position: 'absolute', left: 30, right: 0, bottom: X_LABEL_HEIGHT + 10 - BASELINE_OFFSET, height: CHART_HEIGHT }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT, width: '100%' }}>
          {pointsData.map((p, idx) => {
            // Use Math.round for pixel-perfect bar height
            const barHeight = Math.round((p.points / maxPoints) * CHART_HEIGHT);
            return (
              <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{
                  width: 8,
                  height: barHeight,
                  backgroundColor: teamColor,
                  borderRadius: 4,
                  marginHorizontal: 2,
                }} />
              </View>
            );
          })}
        </View>
        {/* Round numbers aligned with 0 Y-axis */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', height: X_LABEL_HEIGHT, width: '100%', position: 'absolute', left: 0, right: 0, bottom: -X_LABEL_HEIGHT + BASELINE_OFFSET }}>
          {pointsData.map((p, idx) => (
            <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text style={{ color: '#fff', fontSize: 10 }}>{String(p.round).padStart(2, '0')}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* X-axis labels below the round numbers, using flex row and margin for separation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: CHART_HEIGHT + X_LABEL_HEIGHT + 10 }}>
        <Text style={{ color: '#fff', fontSize: 10, opacity: 0.7, paddingLeft: chartPadding }}>Rounds</Text>
        <Text style={{ color: '#fff', fontSize: 10, opacity: 0.7, paddingRight: chartPadding }}>{maxPoints} pts</Text>
      </View>
    </View>
  );
};

export default DriverPointsBarChart;
