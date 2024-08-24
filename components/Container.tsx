import React from 'react';

import { ScrollViewProps, View, ViewProps } from 'react-native';
import { ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/tailwindMerge';

const ScrollViewContainer = (props: ScrollViewProps) => {
  const { children } = props;
  const [currentTheme] = useTheme();
  return (
    <ScrollView style={currentTheme} contentContainerStyle={{ width: '100%', minHeight: '100%', maxWidth: '100%', height: 'auto' }}>
      {children}
    </ScrollView>
  );
};

const Container = (props: ViewProps) => {
  const { children, style, className } = props;
  return (
    <ScrollViewContainer>
      <View style={[{ width: '100%', maxWidth: '100%', minHeight: '100%', height: 'auto' }, style]} className={cn(`bg-base-100 ${className ? className : ''}`)} {...props}>
        {children}
      </View>
    </ScrollViewContainer>
  );
};

export default Container;
