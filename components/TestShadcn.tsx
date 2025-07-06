import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function TestShadcn() {
  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold mb-4 text-center">Shadcn/UI Test</Text>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Welcome to Shadcn/UI</CardTitle>
          <CardDescription>
            This is a test of shadcn/ui components with NativeWind in React Native
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Text className="text-gray-600 mb-4">
            If you can see this styled card and the buttons below, then shadcn/ui is working correctly!
          </Text>
          
          <View className="flex-row gap-2 flex-wrap">
            <Button variant="default" size="sm">
              Default
            </Button>
            <Button variant="destructive" size="sm">
              Destructive
            </Button>
            <Button variant="outline" size="sm">
              Outline
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
            <Button variant="link" size="sm">
              Link
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
} 