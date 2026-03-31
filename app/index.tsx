import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "@/global.css";
import { MoveRight } from "lucide-react-native";

function FloatingOrb({
  size,
  color,
  style,
  delay = 0,
}: {
  size: number;
  color: string;
  style: object;
  delay?: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -18,
          duration: 3200,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
}

function FeatureRow({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
        <Text className="text-xl">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-white">{title}</Text>
        <Text className="text-xs text-white/40">{subtitle}</Text>
      </View>
    </View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeTagline = useRef(new Animated.Value(0)).current;
  const fadeFeatures = useRef(new Animated.Value(0)).current;
  const fadeCta = useRef(new Animated.Value(0)).current;
  const translateLogo = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const fade = (val: Animated.Value, ty: Animated.Value | null, delay: number) =>
      Animated.parallel([
        Animated.timing(val, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
        ...(ty
          ? [Animated.timing(ty, { toValue: 0, duration: 600, delay, useNativeDriver: true })]
          : []),
      ]);

    Animated.stagger(180, [
      fade(fadeLogo, translateLogo, 200),
      fade(fadeTagline, null, 0),
      fade(fadeFeatures, null, 0),
      fade(fadeCta, null, 0),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#020818", "#071a3e", "#0c2461", "#071a3e", "#020818"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        {/* ── Decorative aurora orbs ── */}
        <FloatingOrb size={280} color="rgba(56,189,248,0.12)" style={{ top: -60, left: -60 }} delay={0} />
        <FloatingOrb size={220} color="rgba(99,102,241,0.12)" style={{ top: 120, right: -80 }} delay={600} />
        <FloatingOrb size={200} color="rgba(6,182,212,0.08)" style={{ bottom: 80, left: -40 }} delay={1200} />
        <FloatingOrb size={160} color="rgba(139,92,246,0.10)" style={{ bottom: 200, right: -20 }} delay={400} />

        <View
          style={{
            flex: 1,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 28,
            justifyContent: "space-between",
          }}
        >
          <Animated.View
            style={{ opacity: fadeLogo, transform: [{ translateY: translateLogo }] }}
            className="items-center"
          >
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/10">
              <Text style={{ fontSize: 52, lineHeight: 60 }}>🌤</Text>
            </View>

            <Text
              style={{ fontSize: 42, fontWeight: "800", color: "#ffffff", letterSpacing: -1 }}
            >
              SkyPulse
            </Text>

            <Animated.View style={{ opacity: fadeTagline }} className="mt-3 items-center">
              <Text className="text-center text-base text-sky-300/70">
                Real-time weather, anywhere on Earth
              </Text>
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={{ opacity: fadeFeatures }}
            className="mx-2 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <FeatureRow
              emoji="📡"
              title="Live Weather Data"
              subtitle="Accurate, up-to-the-minute forecasts"
            />
            <View className="h-px bg-white/8" />
            <FeatureRow
              emoji="🗺️"
              title="Global Coverage"
              subtitle="Search any city across 200+ countries"
            />
            <View className="h-px bg-white/8" />
            <FeatureRow
              emoji="📅"
              title="3-Day Forecast"
              subtitle="Hourly breakdowns with rain predictions"
            />
            <View className="h-px bg-white/8" />
            <FeatureRow
              emoji="🌙"
              title="Astronomy Data"
              subtitle="Sunrise, sunset & moon phase info"
            />
          </Animated.View>

          <Animated.View style={{ opacity: fadeCta }} className="gap-3">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace("/home")}
              className="overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={["#38bdf8", "#6366f1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="overflow-hidden rounded-2xl"
              >
                <View className="flex-row items-center justify-center gap-2 py-4">
                  <Text className="text-base font-bold text-white tracking-wide">
                    Get Started
                  </Text>
                  <MoveRight size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <Text className="text-center text-[11px] text-white/20">
              No account required · Free to use
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </>
  );
}