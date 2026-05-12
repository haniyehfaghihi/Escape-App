import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';   
import {
  ActivityIndicator,
  Animated,
  Easing,
  type LayoutChangeEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  fetchOwnerCancelHistory,
  type OwnerCancelHistoryFilter,
  type OwnerCancelHistoryItemDto,
  type OwnerCancelHistoryRequestSource,
  type OwnerCancelHistoryRequestTiming,
  type OwnerCancelHistoryStatus,
} from '@/src/api/cancelHistoryService';
import { ArrowBottom } from '@/src/components/icons/arrow-bottom';
import { useAuth } from '@/src/context/AuthContext';  
import { ArrowLeft } from '@/src/components/icons/arrow-left';

const DETAILS_MAX_HEIGHT = 104;
const FILTER_SCROLL_HINT_PEEK = 32;
const FILTER_SCROLL_MAX_HINT_OFFSET = 52;
const SCREEN_HORIZONTAL_PADDING = 28;

const HISTORY_FILTERS: { id: OwnerCancelHistoryFilter; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'approved', label: 'تایید و لغو سانس' },
  { id: 'pending', label: 'در انتظار بررسی' },
  { id: 'rejected', label: 'رد شده ها' },
  { id: 'overdue', label: 'موعد بررسی گذشت' },
];

const STATUS_UI: Record<
  OwnerCancelHistoryStatus,
  { label: string; backgroundColor: string; textColor: string }
> = {
  approved: {
    label: 'تایید و لغوسانس',
    backgroundColor: '#E6F4EE',
    textColor: '#02A159',
  },
  pending: {
    label: 'در انتظار بررسی',
    backgroundColor: '#FFF1E7',
    textColor: '#FD7013',
  },
  rejected: {
    label: 'رد شده',
    backgroundColor: '#FEE8EC',
    textColor: '#F21543',
  },
  overdue: {
    label: 'موعد بررسی گذشت',
    backgroundColor: '#FEF3C7',
    textColor: '#BF9A00',
  },
};

const REQUEST_TIMING_UI: Record<
  OwnerCancelHistoryRequestTiming,
  { label: string; color: string }
> = {
  above_12: { label: 'بالای 12', color: '#FF6900' },
  below_12: { label: 'زیر 12', color: '#F21543' },
};

const REQUEST_SOURCE_UI: Record<
  OwnerCancelHistoryRequestSource,
  { label: string; color: string }
> = {
  player: { label: 'پلیر', color: '#5091FB' },
  owner: { label: 'شما', color: '#FF6900' },
};

function CancelHistoryItemCard({ item }: { item: OwnerCancelHistoryItemDto }) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const detailsAnimation = useRef(new Animated.Value(0)).current;
  const statusUi = STATUS_UI[item.status];
  const timingUi = REQUEST_TIMING_UI[item.requestTiming];
  const sourceUi = REQUEST_SOURCE_UI[item.requestSource];

  const toggleDetails = () => {
    const nextExpanded = !detailsExpanded;
    setDetailsExpanded(nextExpanded);

    Animated.timing(detailsAnimation, {
      toValue: nextExpanded ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View className="mt-7 flex items-center justify-between border-t border-[#E4EBF0] pt-5">
      <View className="flex w-full flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm font-bold text-[#889BAD]">نوع درخواست</Text>
          <Text className="text-sm font-bold" style={{ color: timingUi.color }}>
            {timingUi.label}
          </Text>
          <Text className="text-sm font-bold text-[#889BAD]">.</Text>
          <Text className="text-sm font-bold" style={{ color: sourceUi.color }}>
            {sourceUi.label}
          </Text>
        </View>

        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm font-bold text-[#889BAD]">تاریخ درخواست</Text>
          <Text className="text-sm font-bold">{item.requestDate}</Text>
        </View>
      </View>

      <View className="mt-4 flex w-full flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-1">
          <Text className="text-sm font-bold text-[#889BAD]">کد رزرو</Text>
          <Text className="text-sm font-bold">{item.reserveCode}</Text>
        </View>

        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm font-bold text-[#889BAD]">تاریخ بازی</Text>
          <Text className="text-sm font-bold">{item.gameDate}</Text>
        </View>
      </View>

      <View
        className="mt-4 flex h-[34px] w-full flex-row items-center justify-center rounded-lg"
        style={{ backgroundColor: statusUi.backgroundColor }}
      >
        <Text className="text-base font-bold" style={{ color: statusUi.textColor }}>
          {statusUi.label}
        </Text>
      </View>

      <Pressable
        onPress={toggleDetails}
        className="my-5 flex flex-row items-center justify-center gap-2 self-center"
        accessibilityRole="button"
        accessibilityLabel={detailsExpanded ? 'مشاهده کمتر' : 'مشاهده جزییات بیشتر'}
      >
        <View className="flex flex-row items-center gap-x-1.5">
          {detailsExpanded ? (
            <>
              <Text className="shrink-0 text-sm font-bold text-[#889BAD]">مشاهده</Text>
              <Text className="shrink-0 text-sm font-bold text-[#889BAD]">کمتر</Text>
            </>
          ) : (
            <>
              <Text className="shrink-0 text-sm font-bold text-[#889BAD]">مشاهده جزییات</Text>
              <Text className="shrink-0 text-sm font-bold text-[#889BAD]">بیشتر</Text>
            </>
          )}
        </View>
        <Animated.View
          style={{
            transform: [
              {
                rotate: detailsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <ArrowBottom width={12} height={12} />
        </Animated.View>
      </Pressable>

      <Animated.View
        className="w-full overflow-hidden"
        style={{
          height: detailsAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, DETAILS_MAX_HEIGHT],
          }),
          opacity: detailsAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: detailsAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-8, 0],
              }),
            },
          ],
        }}
      >
        <View className="w-full flex-col items-start gap-3 rounded-lg bg-[#F7FAFA] p-5">
          <Text className="w-full text-sm font-bold" numberOfLines={1}>
            <Text className="text-[#889BAD]">نام پلیر </Text>
            <Text>{item.playerName}</Text>
          </Text>

          <Text className="w-full text-sm font-bold" numberOfLines={1}>
            <Text className="text-[#889BAD]">نام بازی </Text>
            <Text>{item.gameName}</Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function CancelHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoaded: authLoaded, userToken } = useAuth();
  const [activeFilter, setActiveFilter] = useState<OwnerCancelHistoryFilter>('all');
  const [items, setItems] = useState<OwnerCancelHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filterScrollRef = useRef<ScrollView>(null);
  const filterViewportWidthRef = useRef(0);
  const filterContentWidthRef = useRef(0);
  const filterHintAppliedRef = useRef(false);

  const applyFilterScrollHint = useCallback((contentWidth: number) => {
    const viewportWidth = filterViewportWidthRef.current;
    if (filterHintAppliedRef.current || viewportWidth <= 0 || contentWidth <= viewportWidth) {
      return;
    }

    const overflow = contentWidth - viewportWidth;
    const hintOffset = Math.min(
      Math.max(overflow - FILTER_SCROLL_HINT_PEEK, FILTER_SCROLL_HINT_PEEK * 0.5),
      FILTER_SCROLL_MAX_HINT_OFFSET,
    );

    filterScrollRef.current?.scrollTo({ x: hintOffset, animated: false });
    filterHintAppliedRef.current = true;
  }, []);

  const handleFilterViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      filterViewportWidthRef.current = event.nativeEvent.layout.width;
      if (filterContentWidthRef.current > 0) {
        applyFilterScrollHint(filterContentWidthRef.current);
      }
    },
    [applyFilterScrollHint],
  );

  const handleFilterContentSizeChange = useCallback(
    (width: number) => {
      filterContentWidthRef.current = width;
      applyFilterScrollHint(width);
    },
    [applyFilterScrollHint],
  );

  const load = useCallback(
    async (mode: 'initial' | 'refresh', filter: OwnerCancelHistoryFilter) => {
      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const list = await fetchOwnerCancelHistory(authLoaded ? userToken : null, filter);
        setItems(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطا در دریافت تاریخچه لغو');
        setItems([]);
      } finally {
        if (mode === 'refresh') setRefreshing(false);
        else setLoading(false);
      }
    },
    [authLoaded, userToken],
  );

  useFocusEffect(
    useCallback(() => {
      if (!authLoaded) return;
      void load('initial', activeFilter);
    }, [activeFilter, authLoaded, load]),
  );

  const handleFilterChange = useCallback(
    (filter: OwnerCancelHistoryFilter) => {
      setActiveFilter(filter);
    },
    [],
  );

  const emptyMessage = useMemo(() => {
    if (activeFilter === 'all') return 'سابقه لغوی ثبت نشده است.';
    const label = HISTORY_FILTERS.find((filter) => filter.id === activeFilter)?.label;
    return `موردی برای «${label ?? 'این فیلتر'}» وجود ندارد.`;
  }, [activeFilter]);

  return (
    <View className="flex-1 bg-white">
      <View className="mt-8 flex flex-row items-center justify-between px-7 py-2 mb-7">
        <Text className="text-xl font-bold text-[#62748E]">تاریخچه لغو</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12} 
          accessibilityRole="button"
          accessibilityLabel="بازگشت"
          android_ripple={{ color: 'rgba(15, 23, 43, 0.08)' }}
          className="h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#F1F5F9] p-2"
          style={{ borderRadius: 8 }}
        >
          <ArrowLeft width={13} height={13} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 130,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh', activeFilter)}
          />
        }
      >
        <View
          className="overflow-hidden rounded-l-lg border border-[#E4EBF0]"
          style={{ marginEnd: -SCREEN_HORIZONTAL_PADDING }}
          onLayout={handleFilterViewportLayout}
        >
          <ScrollView
            ref={filterScrollRef}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={{ height: 50 }}
            contentContainerStyle={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 50,
              paddingEnd: 0,
            }}
            onContentSizeChange={handleFilterContentSizeChange}
          >
          {HISTORY_FILTERS.map((filter, index) => {
            const isActive = activeFilter === filter.id;

            return (
              <Pressable
                key={filter.id}
                onPress={() => handleFilterChange(filter.id)}
                className={`h-[50px] shrink-0 items-center justify-center px-3 ${
                  isActive ? 'bg-[#FD7013]' : 'bg-transparent'
                } ${index === 0 ? 'rounded-l-lg' : ''} ${
                  index === HISTORY_FILTERS.length - 1 ? 'rounded-r-lg' : ''
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={filter.label}
              >
                <Text
                  numberOfLines={1}
                  className={`shrink-0 text-base font-bold ${
                    isActive ? 'text-white' : 'text-[#889BAD]'
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
          </ScrollView>
        </View>

        {!authLoaded || loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#5091FB" />
          </View>
        ) : error ? (
          <View className="items-center gap-3 py-8">
            <Text className="text-center text-sm text-[#64748B]">{error}</Text>
            <Pressable
              onPress={() => void load('initial', activeFilter)}
              className="rounded-lg bg-[#5091FB] px-4 py-2"
              accessibilityRole="button"
              accessibilityLabel="تلاش دوباره"
            >
              <Text className="text-sm font-bold text-white">تلاش دوباره</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <Text className="py-8 text-center text-sm font-bold text-[#889BAD]">{emptyMessage}</Text>
        ) : (
          items.map((item) => <CancelHistoryItemCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}
