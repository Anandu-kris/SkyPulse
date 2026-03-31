import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { LocateFixed } from "lucide-react-native";
import DropdownSelectModal, { type DropdownItem } from "../components/DropDownModal";
import "@/global.css";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type CountryItem = DropdownItem & { code: string; phoneCode?: string };
type CityItem = DropdownItem & {
  state?: string;
  lat?: number;
  lon?: number;
  countryCode: string;
};


function getFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

let _countriesCache: CountryItem[] | null = null;

async function getCountries(): Promise<CountryItem[]> {
  if (_countriesCache) return _countriesCache;
  await new Promise<void>((r) => setTimeout(r, 0));
  const { Country } = await import("country-state-city");
  _countriesCache = Country.getAllCountries().map((c) => ({
    id: c.isoCode,
    label: c.name,
    subLabel: "Country",
    iconText: getFlagEmoji(c.isoCode),
    code: c.isoCode,
    phoneCode: c.phonecode,
  }));
  return _countriesCache;
}

const _cityCache: Record<string, CityItem[]> = {};

async function getCities(countryCode: string): Promise<CityItem[]> {
  if (_cityCache[countryCode]) return _cityCache[countryCode];
  await new Promise<void>((r) => setTimeout(r, 0));
  const { City } = await import("country-state-city");
  const raw = City.getCitiesOfCountry(countryCode) ?? [];

  const seen = new Set<string>();
  const cities: CityItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const city = raw[i];
    const key = `${city.name.toLowerCase()}|${city.stateCode ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cities.push({
      id: `${city.name}-${city.stateCode ?? "na"}-${i}`,
      label: city.name,
      subLabel: `${city.stateCode ? `${city.stateCode} • ` : ""}${city.latitude ?? "—"}, ${city.longitude ?? "—"}`,
      iconText: city.name.charAt(0).toUpperCase(),
      state: city.stateCode ?? "",
      lat: city.latitude ? Number(city.latitude) : undefined,
      lon: city.longitude ? Number(city.longitude) : undefined,
      countryCode: city.countryCode,
    });
  }
  _cityCache[countryCode] = cities;
  return cities;
}


function SelectBox({
  label,
  value,
  icon,
  onPress,
  disabled = false,
  sublabel,
  loading = false,
}: {
  label: string;
  value: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  sublabel?: string;
  loading?: boolean;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-1.5 text-[11px] font-semibold tracking-widest uppercase text-sky-300/70">
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.75}
        className={`flex-row items-center justify-between rounded-2xl px-4 py-3.5 ${
          disabled || loading
            ? "bg-white/5 opacity-40"
            : "bg-white/10 border border-white/15"
        }`}
      >
        <View className="flex-row items-center gap-3">
          {icon ? (
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Text className="text-xl">{icon}</Text>
            </View>
          ) : (
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-sky-500/30">
              <Text className="text-sm font-bold text-sky-300">
                {value.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text className="text-sm font-semibold text-white" numberOfLines={1}>
              {value}
            </Text>
            {sublabel ? (
              <Text className="text-xs text-white/40">{sublabel}</Text>
            ) : null}
          </View>
        </View>
        <View className="h-7 w-7 items-center justify-center rounded-full bg-white/10">
          <Text className="text-xs text-white/60">›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function StatPill({ emoji, title, value }: { emoji: string; title: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-white/8 border border-white/10 py-3 px-2">
      <Text className="text-base">{emoji}</Text>
      <Text className="mt-1 text-[10px] font-medium text-white/40">{title}</Text>
      <Text className="mt-0.5 text-xs font-semibold text-white/80" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}


export default function WeatherHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [countriesReady, setCountriesReady] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);

  const [cityOptions, setCityOptions] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);

  useEffect(() => {
    getCountries().then((data) => {
      setCountries(data);
      // Default to India
      const india = data.find((c) => c.code === "IN") ?? data[0];
      setSelectedCountry(india);
      setCountriesReady(true);
    });
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    let cancelled = false;
    setCityOptions([]);
    setCitiesLoading(true);
    setSelectedCity(null);

    getCities(selectedCountry.code).then((data) => {
      if (!cancelled) {
        setCityOptions(data);
        setCitiesLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [selectedCountry]);

  const handleCountrySelect = useCallback((item: DropdownItem) => {
    setSelectedCountry(item as CountryItem);
  }, []);

  const handleCitySelect = useCallback((item: DropdownItem) => {
    setSelectedCity(item as CityItem);
  }, []);

  const handleGetWeather = useCallback(() => {
    if (!selectedCity || !selectedCountry) return;
    router.push({
      pathname: "/weather",
      params: {
        city: selectedCity.label,
        country: selectedCountry.label,
        state: selectedCity.state ?? "",
        lat: selectedCity.lat ? String(selectedCity.lat) : "",
        lon: selectedCity.lon ? String(selectedCity.lon) : "",
        countryCode: selectedCity.countryCode,
      },
    });
  }, [selectedCity, selectedCountry, router]);

  const hasCity = Boolean(selectedCity);
  const coordText =
    selectedCity?.lat != null && selectedCity?.lon != null
      ? `${selectedCity.lat.toFixed(2)}, ${selectedCity.lon.toFixed(2)}`
      : "—";

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#020818", "#071a3e", "#0c2461", "#071a3e", "#020818"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        className="flex-1"
      >
        <View className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <View className="absolute top-40 -right-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
        <View className="absolute bottom-32 -left-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

        <View
          className="flex-1"
          style={{
            paddingTop: insets.top + 36,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 20,
          }}
        >
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/10">
              <Text className="text-3xl">🌤</Text>
            </View>
            <Text className="text-3xl font-bold tracking-tight text-white">SkyPulse</Text>
            <Text className="mt-1 text-sm text-sky-300/70">
              Real-time weather anywhere on Earth
            </Text>
          </View>

          <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <View className="mb-4 flex-row items-center">
              <LocateFixed size={16} color="rgba(255,255,255,0.5)" />
              <Text className="ml-2 text-xs font-bold tracking-widest uppercase text-white/30">
                Choose Location
              </Text>
            </View>

            <SelectBox
              label="Country"
              value={selectedCountry?.label ?? "Loading…"}
              icon={selectedCountry?.iconText}
              sublabel={
                selectedCountry
                  ? `+${selectedCountry.phoneCode ?? "—"} · ${selectedCountry.code}`
                  : undefined
              }
              onPress={() => setCountryModalOpen(true)}
              loading={!countriesReady}
            />

            <SelectBox
              label={`City — ${selectedCountry?.label ?? "…"}`}
              value={
                citiesLoading
                  ? "Loading cities…"
                  : selectedCity?.label ?? "Select a city"
              }
              sublabel={
                selectedCity?.state ? `${selectedCity.state} province` : undefined
              }
              onPress={() => setCityModalOpen(true)}
              disabled={!countriesReady || citiesLoading || cityOptions.length === 0}
              loading={citiesLoading}
            />

            <View className="my-4 h-px bg-white/8" />

            <View className="flex-row gap-2">
              <StatPill emoji="🏙" title="City" value={selectedCity?.label ?? "—"} />
              <StatPill emoji="🗺" title="State" value={selectedCity?.state || "—"} />
              <StatPill emoji="📡" title="Coords" value={coordText} />
            </View>
          </View>

          <View className="mt-5">
            {hasCity ? (
              <LinearGradient
                colors={["#38bdf8", "#6366f1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="overflow-hidden rounded-2xl"
              >
                <TouchableOpacity
                  onPress={handleGetWeather}
                  activeOpacity={0.85}
                  className="flex-row items-center justify-center gap-2 py-4"
                >
                  <Text className="text-base font-bold tracking-wide text-white">
                    Get Weather
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              <View className="rounded-2xl border border-white/10 bg-white/8 py-4">
                <Text className="text-center text-sm font-semibold text-white/30">
                  {citiesLoading ? "Loading cities…" : "Select a city to continue"}
                </Text>
              </View>
            )}
          </View>

          <Text className="mt-6 text-center text-[11px] text-white/20">
            Powered by open weather data · {countries.length || "…"} countries available
          </Text>
        </View>
      </LinearGradient>

      <DropdownSelectModal
        visible={countryModalOpen}
        title="Select Country"
        placeholder="Search country…"
        data={countries}
        onClose={() => setCountryModalOpen(false)}
        onSelect={handleCountrySelect}
      />

      <DropdownSelectModal
        visible={cityModalOpen}
        title={`Cities in ${selectedCountry?.label ?? "…"}`}
        placeholder="Search city…"
        data={cityOptions}
        loading={citiesLoading}
        onClose={() => setCityModalOpen(false)}
        onSelect={handleCitySelect}
      />
    </>
  );
}