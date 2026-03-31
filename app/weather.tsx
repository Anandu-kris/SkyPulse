import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Moon,
  Sun,
  Umbrella,
  Wind,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

type WeatherApiResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    pressure_mb: number;
    vis_km: number;
    uv: number;
    precip_mm: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
        moon_phase: string;
      };
      hour: {
        time: string;
        temp_c: number;
        chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
        };
      }[];
    }[];
  };
};

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="text-xs font-bold tracking-widest uppercase text-sky-300/70">
        {title}
      </Text>
      {action ? (
        <Text className="text-xs font-semibold text-sky-400">{action}</Text>
      ) : null}
    </View>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-3xl border border-white/10 bg-white/5 p-4 ${className}`}>
      {children}
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="mb-3 w-[48%] rounded-2xl border border-white/10 bg-white/8 p-4">
      <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
        {icon}
      </View>
      <Text className="text-[11px] font-medium text-white/40">{label}</Text>
      <Text className="mt-1 text-base font-bold text-white">{value}</Text>
    </View>
  );
}

function HourlyWeatherCard({
  item,
  active = false,
}: {
  item: {
    time: string;
    temp_c: number;
    chance_of_rain: number;
    condition: { text: string; icon: string };
  };
  active?: boolean;
}) {
  const iconUrl = item.condition.icon.startsWith("//")
    ? `https:${item.condition.icon}`
    : item.condition.icon;

  return (
    <View
      className={`mr-3 w-20.5 items-center rounded-2xl px-3 py-4 ${
        active
          ? "border border-sky-400/50 bg-sky-500/30"
          : "border border-white/10 bg-white/5"
      }`}
    >
      <Text className={`text-[11px] font-medium ${active ? "text-sky-300" : "text-white/40"}`}>
        {item.time}
      </Text>

      <Image
        source={{ uri: iconUrl }}
        className="mx-auto my-2 h-11 w-11"
        resizeMode="contain"
      />

      <Text className={`text-base font-bold ${active ? "text-white" : "text-white/80"}`}>
        {item.temp_c}°
      </Text>

      <Text className={`mt-1 text-[10px] ${active ? "text-sky-300/80" : "text-white/30"}`}>
        {item.chance_of_rain}%
      </Text>
    </View>
  );
}

function ForecastDayCard({
  item,
  dayLabel,
}: {
  item: WeatherApiResponse["forecast"]["forecastday"][number];
  dayLabel: string;
}) {
  const iconUrl = item.day.condition.icon.startsWith("//")
    ? `https:${item.day.condition.icon}`
    : item.day.condition.icon;

  return (
    <View className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <View className="flex-row items-center">
        <View className="mr-3 rounded-xl bg-white/10 p-2">
          <Image source={{ uri: iconUrl }} className="h-10 w-10" resizeMode="contain" />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-bold text-white">{dayLabel}</Text>
          <Text className="mt-0.5 text-xs text-white/40">{item.day.condition.text}</Text>
        </View>

        <View className="items-end">
          <Text className="text-sm font-bold text-white">{item.day.maxtemp_c}°</Text>
          <Text className="mt-0.5 text-xs text-white/40">{item.day.mintemp_c}°</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between rounded-xl bg-white/5 px-4 py-3">
        <View className="items-center">
          <Text className="text-[10px] text-white/35">Avg</Text>
          <Text className="mt-0.5 text-xs font-semibold text-white/70">{item.day.avgtemp_c}°</Text>
        </View>
        <View className="h-8 w-px bg-white/10" />
        <View className="items-center">
          <Text className="text-[10px] text-white/35">Rain</Text>
          <Text className="mt-0.5 text-xs font-semibold text-white/70">{item.day.daily_chance_of_rain}%</Text>
        </View>
        <View className="h-8 w-px bg-white/10" />
        <View className="items-center">
          <Text className="text-[10px] text-white/35">Sunrise</Text>
          <Text className="mt-0.5 text-xs font-semibold text-white/70">{item.astro.sunrise}</Text>
        </View>
      </View>
    </View>
  );
}

function AppBackground({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={["#020818", "#071a3e", "#0c2461", "#071a3e", "#020818"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        className="flex-1"
      >
        <View className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <View className="absolute top-40 -right-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
        <View className="absolute bottom-32 -left-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        {children}
      </LinearGradient>
    </>
  );
}

export default function WeatherScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    city?: string;
    country?: string;
    state?: string;
    lat?: string;
    lon?: string;
  }>();

  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    if (params.lat && params.lon) return `${params.lat},${params.lon}`;
    return params.city ?? "";
  }, [params.city, params.lat, params.lon]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");
        const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) throw new Error("Missing EXPO_PUBLIC_WEATHER_API_KEY in .env");
        if (!query) throw new Error("Missing location query");

        const url =
          `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}` +
          `&q=${encodeURIComponent(query)}&days=3&aqi=yes&alerts=yes`;

        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error?.message || "Failed to fetch weather");
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [query]);

  if (loading) {
    return (
      <AppBackground>
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="items-center rounded-3xl border border-white/10 bg-white/5 px-10 py-10">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10">
              <Text className="text-4xl">🌤️</Text>
            </View>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text className="mt-5 text-lg font-bold text-white">Fetching Weather</Text>
            <Text className="mt-1 text-center text-sm text-white/40">
              Getting latest forecast for your location…
            </Text>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (error || !weather) {
    return (
      <AppBackground>
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="items-center rounded-3xl border border-white/10 bg-white/5 px-8 py-10">
            <Text className="text-4xl">⚠️</Text>
            <Text className="mt-4 text-center text-lg font-bold text-white">
              Could not load weather
            </Text>
            <Text className="mt-2 text-center text-sm text-white/40">
              {error || "No weather data found"}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="mt-6 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={["#38bdf8", "#6366f1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="overflow-hidden rounded-2xl px-8 py-3"
              >
                <Text className="font-bold text-white">Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </AppBackground>
    );
  }

  const today = weather.forecast.forecastday[0];
  const currentIcon = weather.current.condition.icon.startsWith("//")
    ? `https:${weather.current.condition.icon}`
    : weather.current.condition.icon;

  const hourlyItems = today.hour.slice(0, 8).map((hour, index) => ({
    ...hour,
    time:
      index === 0
        ? "Now"
        : new Date(hour.time).toLocaleTimeString([], { hour: "numeric" }),
  }));

  const dayLabels = ["Today", "Tomorrow", "Day 3"];

  return (
    <AppBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10"
          >
            <ArrowLeft size={18} color="#fff" />
          </TouchableOpacity>

          <View className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5">
            <Text className="text-xs font-bold tracking-widest uppercase text-sky-300/80">
              3-Day Forecast
            </Text>
          </View>
        </View>

        <View className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <View className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />

          <View className="p-5">
            <View className="mb-4 flex-row items-center">
              <MapPin size={13} color="#7dd3fc" />
              <Text className="ml-1.5 text-xs font-semibold text-sky-300/80">
                {weather.location.name}, {weather.location.country}
              </Text>
            </View>

            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[72px] font-bold leading-none text-white">
                  {weather.current.temp_c}°
                </Text>
                <Text className="mt-2 text-xl font-semibold text-white/80">
                  {weather.current.condition.text}
                </Text>
                <Text className="mt-1 text-sm text-white/45">
                  Feels like {weather.current.feelslike_c}° · H:{today.day.maxtemp_c}° L:{today.day.mintemp_c}°
                </Text>
              </View>

              <View className="rounded-2xl border border-white/15 bg-white/10 p-3">
                <Image source={{ uri: currentIcon }} className="h-20 w-20" resizeMode="contain" />
              </View>
            </View>

            <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
              <View className="items-center">
                <Text className="text-[10px] text-white/35">Humidity</Text>
                <Text className="mt-0.5 text-sm font-bold text-white">{weather.current.humidity}%</Text>
              </View>
              <View className="h-8 w-px bg-white/10" />
              <View className="items-center">
                <Text className="text-[10px] text-white/35">Wind</Text>
                <Text className="mt-0.5 text-sm font-bold text-white">{weather.current.wind_kph} km/h</Text>
              </View>
              <View className="h-8 w-px bg-white/10" />
              <View className="items-center">
                <Text className="text-[10px] text-white/35">Rain</Text>
                <Text className="mt-0.5 text-sm font-bold text-white">{today.day.daily_chance_of_rain}%</Text>
              </View>
              <View className="h-8 w-px bg-white/10" />
              <View className="items-center">
                <Text className="text-[10px] text-white/35">Local time</Text>
                <Text className="mt-0.5 text-sm font-bold text-white">
                  {weather.location.localtime.split(" ")[1]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <GlassCard className="mb-4">
          <SectionTitle title="Today's Highlights" />
          <View className="flex-row flex-wrap justify-between">
            <StatCard icon={<Droplets size={18} color="#38bdf8" />} label="Humidity" value={`${weather.current.humidity}%`} />
            <StatCard icon={<Wind size={18} color="#38bdf8" />} label="Wind Speed" value={`${weather.current.wind_kph} km/h`} />
            <StatCard icon={<Gauge size={18} color="#38bdf8" />} label="Pressure" value={`${weather.current.pressure_mb} mb`} />
            <StatCard icon={<Eye size={18} color="#38bdf8" />} label="Visibility" value={`${weather.current.vis_km} km`} />
            <StatCard icon={<Sun size={18} color="#fbbf24" />} label="UV Index" value={`${weather.current.uv}`} />
            <StatCard icon={<Umbrella size={18} color="#38bdf8" />} label="Precipitation" value={`${weather.current.precip_mm} mm`} />
          </View>
        </GlassCard>

        <GlassCard className="mb-4">
          <SectionTitle title="Hourly Forecast" action="Today" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {hourlyItems.map((item, index) => (
              <HourlyWeatherCard key={`${item.time}-${index}`} item={item} active={index === 0} />
            ))}
          </ScrollView>
        </GlassCard>

        <GlassCard className="mb-4">
          <SectionTitle title="Next 3 Days" />
          {weather.forecast.forecastday.map((item, index) => (
            <ForecastDayCard key={item.date} item={item} dayLabel={dayLabels[index] ?? item.date} />
          ))}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Astronomy" />

          <View className="flex-row justify-between gap-3">

            <View className="flex-1 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <Sun size={18} color="#fbbf24" />
              </View>
              <Text className="text-[10px] font-medium text-white/40">Sunrise</Text>
              <Text className="mt-1 text-sm font-bold text-white">{today.astro.sunrise}</Text>
            </View>

            <View className="flex-1 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                <Moon size={18} color="#818cf8" />
              </View>
              <Text className="text-[10px] font-medium text-white/40">Moon Phase</Text>
              <Text className="mt-1 text-sm font-bold text-white">{today.astro.moon_phase}</Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center rounded-2xl border border-orange-400/15 bg-orange-500/8 px-4 py-3">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Sun size={18} color="#fb923c" />
            </View>
            <View>
              <Text className="text-[10px] font-medium text-white/40">Sunset</Text>
              <Text className="mt-0.5 text-sm font-bold text-white">{today.astro.sunset}</Text>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </AppBackground>
  );
}