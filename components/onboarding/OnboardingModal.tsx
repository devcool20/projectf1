import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { X, MessageCircle, Home, Calendar, ShoppingBag, Users, Newspaper, Bookmark, Zap } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import CarLoadingAnimation from '../CarLoadingAnimation';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const features = [
  {
    icon: MessageCircle,
    title: 'Threads',
    description: 'Share your thoughts, race predictions, and engage with the F1 community through threaded discussions.',
    color: '#dc2626'
  },
  {
    icon: Newspaper,
    title: 'News',
    description: 'Stay updated with the latest Formula 1 news, race results, and team announcements.',
    color: '#1d4ed8'
  },
  {
    icon: Calendar,
    title: 'Screenings',
    description: 'Find and join F1 race screenings, watch parties, and community events near you.',
    color: '#059669'
  },
  {
    icon: Users,
    title: 'Drivers',
    description: 'Explore driver profiles, statistics, and follow your favorite F1 drivers.',
    color: '#7c3aed'
  },
  {
    icon: ShoppingBag,
    title: 'Shop',
    description: 'Browse official F1 merchandise, team gear, and exclusive racing collectibles.',
    color: '#ea580c'
  }
];

export function OnboardingModal({ visible, onClose, onSignUp }: OnboardingModalProps) {
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.8);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start animations
      overlayOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      modalOpacity.value = withTiming(1, { duration: 300 });
      
      // Animate title
      titleScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
      titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      
      // Animate features
      featuresOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      
      // Animate CTA
      ctaScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));
      ctaOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    } else {
      // Reset animations
      overlayOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      titleScale.value = withTiming(0.8, { duration: 200 });
      titleOpacity.value = withTiming(0, { duration: 200 });
      featuresOpacity.value = withTiming(0, { duration: 200 });
      ctaScale.value = withTiming(0.8, { duration: 200 });
      ctaOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
    opacity: ctaOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, overlayStyle]}>
        <Animated.View style={[styles.modalContent, modalStyle]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            {/* Welcome Section */}
            <Animated.View style={[styles.welcomeSection, titleStyle]}>
              <View style={styles.logoContainer}>
                <Text style={styles.welcomeTitle}>Welcome to</Text>
                <Text style={styles.brandTitle}>projectF1</Text>
                <View style={styles.sparkleContainer}>
                  <Zap size={20} color="#dc2626" style={styles.sparkle1} />
                  <Zap size={16} color="#dc2626" style={styles.sparkle2} />
                  <Zap size={18} color="#dc2626" style={styles.sparkle3} />
                </View>
              </View>
              <Text style={styles.welcomeSubtitle}>
                Your ultimate destination for Formula 1 community, news, and racing excitement!
              </Text>
            </Animated.View>

            {/* Car Animation Section */}
            <Animated.View style={[styles.carAnimationSection, featuresStyle]}>
              <View style={styles.carAnimationContainer}>
                <CarLoadingAnimation 
                  duration={2000}
                />
              </View>
            </Animated.View>

            {/* Features Section */}
            <Animated.View style={[styles.featuresSection, featuresStyle]}>
              <Text style={styles.featuresTitle}>What you can do:</Text>
              
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <View key={index} style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                      <IconComponent size={24} color="#ffffff" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                );
              })}
            </Animated.View>

            {/* Call to Action */}
            <Animated.View style={[styles.ctaSection, ctaStyle]}>
              <Text style={styles.ctaTitle}>Ready for vroom vroom?</Text>
              <Text style={styles.ctaSubtitle}>Join thousands of F1 fans and start your racing journey!</Text>
              
              <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                <Text style={styles.continueButtonText}>Continue without signup</Text>
              </TouchableOpacity>
              
              <Text style={styles.noteText}>
                Note: Without signup you can browse content but cannot post or interact
              </Text>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Formula1-Regular',
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
    fontFamily: 'Formula1-Bold',
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -20,
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  sparkle2: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  sparkle3: {
    position: 'absolute',
    top: 30,
    right: 0,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Formula1-Regular',
  },
  carAnimationSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  carAnimationContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuresSection: {
    padding: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    fontFamily: 'Formula1-Bold',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Formula1-Bold',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontFamily: 'Formula1-Regular',
  },
  ctaSection: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Formula1-Bold',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Formula1-Regular',
  },
  signUpButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Formula1-Bold',
  },
  continueButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#666666',
  },
  continueButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Formula1-Regular',
  },
  noteText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Formula1-Regular',
    fontStyle: 'italic',
  },
}); 