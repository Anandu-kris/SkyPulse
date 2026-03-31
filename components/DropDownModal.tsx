import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X } from "lucide-react-native";

export type DropdownItem = {
  id: string;
  label: string;
  subLabel?: string;
  iconText?: string;
};

type Props = {
  visible: boolean;
  title: string;
  placeholder?: string;
  data: DropdownItem[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (item: DropdownItem) => void;
};

const ITEM_HEIGHT = 68;

export default function DropdownSelectModal({
  visible,
  title,
  placeholder = "Search...",
  data,
  loading = false,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSearch("");
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subLabel?.toLowerCase().includes(q)
    );
  }, [search, data]);

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      onSelect(item);
      setSearch("");
      onClose();
    },
    [onSelect, onClose]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: DropdownItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: DropdownItem }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
        style={{ height: ITEM_HEIGHT }}
        className="flex-row items-center border-b border-white/5 px-5"
      >
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Text style={{ fontSize: item.iconText && item.iconText.length > 1 ? 22 : 16 }}>
            {item.iconText ?? item.label.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {item.label}
          </Text>
          {item.subLabel ? (
            <Text className="mt-0.5 text-xs text-white/40" numberOfLines={1}>
              {item.subLabel}
            </Text>
          ) : null}
        </View>

        <Text className="text-white/25 text-xl">›</Text>
      </TouchableOpacity>
    ),
    [handleSelect]
  );

  const ListEmpty = useMemo(
    () => (
      <View className="items-center py-16">
        {loading ? (
          <>
            <ActivityIndicator color="#38bdf8" />
            <Text className="mt-3 text-sm text-white/40">Loading…</Text>
          </>
        ) : (
          <>
            <Text className="text-2xl">🔍</Text>
            <Text className="mt-2 text-sm text-white/40">No results found</Text>
          </>
        )}
      </View>
    ),
    [loading]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View
          className="rounded-t-3xl border-t border-white/10 bg-[#071a3e]"
          style={{ maxHeight: "82%", paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="h-1 w-10 rounded-full bg-white/20" />
          </View>

          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-base font-bold text-white">{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
            >
              <X size={15} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="mx-5 mb-3 flex-row items-center gap-3 rounded-2xl border border-white/15 bg-white/8 px-4 py-3">
            <Search size={15} color="rgba(255,255,255,0.4)" />
            <TextInput
              ref={inputRef}
              value={search}
              onChangeText={setSearch}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.25)"
              className="flex-1 text-sm text-white"
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {!loading && (
            <Text className="mb-2 px-5 text-[11px] text-white/25">
              {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
            </Text>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            ListEmptyComponent={ListEmpty}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={14}       
            maxToRenderPerBatch={20}       
            windowSize={5}                
            removeClippedSubviews={true}   
            updateCellsBatchingPeriod={40} 
          />
        </View>
      </View>
    </Modal>
  );
}