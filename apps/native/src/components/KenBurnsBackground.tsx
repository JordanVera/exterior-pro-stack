import { useEffect, useState } from 'react';
import { StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const SLIDES: ImageSourcePropType[] = [
  require('../../assets/login/login-bg-1.webp'),
  require('../../assets/login/login-bg-2.webp'),
  require('../../assets/login/login-bg-3.jpg'),
];

/** How long each photo holds before handing off. */
const SLIDE_MS = 6500;
const FADE_MS = 1600;

/**
 * Slow zoom-and-drift photo backdrop that crossfades between exterior job
 * shots. Purely decorative: the scrim above it is what makes the form legible,
 * so swapping the photography can never break the screen.
 */
export function KenBurnsBackground() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % SLIDES.length),
      SLIDE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {SLIDES.map((source, i) => (
        <Slide
          key={i}
          source={source}
          active={i === index}
          // Alternate the drift so consecutive photos do not slide the same way.
          direction={i % 2 === 0 ? 1 : -1}
          reduceMotion={reduceMotion}
        />
      ))}

      {/* Flat knock-down first, so even the brightest sky never competes with
          white text, then a gradient that goes solid behind the form. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(7,11,18,0.2)' },
        ]}
      />
      <LinearGradient
        colors={[
          'rgba(7,11,18,0.35)',
          'rgba(7,11,18,0.72)',
          'rgba(7,11,18,0.97)',
          '#070B12',
        ]}
        locations={[0, 0.42, 0.72, 0.92]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function Slide({
  source,
  active,
  direction,
  reduceMotion,
}: {
  source: ImageSourcePropType;
  active: boolean;
  direction: number;
  reduceMotion: boolean;
}) {
  const opacity = useSharedValue(active ? 1 : 0);
  const progress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: FADE_MS });

    // Reduced motion keeps the crossfade (a fade is the accessible substitute
    // for movement) but drops the pan and zoom entirely.
    if (active && !reduceMotion) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: SLIDE_MS + FADE_MS * 2,
        easing: Easing.linear,
      });
    }
  }, [active, reduceMotion, opacity, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: 1.08 + progress.value * 0.14 },
      { translateX: direction * progress.value * 16 },
      { translateY: progress.value * -12 },
    ],
  }));

  return (
    <Animated.Image
      source={source}
      resizeMode="cover"
      style={[
        StyleSheet.absoluteFill,
        { width: '100%', height: '100%' },
        style,
      ]}
    />
  );
}
