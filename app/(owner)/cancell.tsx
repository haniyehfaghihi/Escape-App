import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { AttentionIcon } from '@/src/components/icons/attention';
import { TimeIcon } from '@/src/components/icons/time';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hourglass } from '@/src/components/icons/hourglass';
import { ArrowBottom } from '@/src/components/icons/arrow-bottom';

const DETAILS_MAX_HEIGHT = 188;

type CancelFilter = 'all' | 'urgent' | 'overdue';

type CancelRequest = {
  id: string;
  category: Exclude<CancelFilter, 'all'>;
  title: string;
  badgeLabel?: string;
  submittedAgo: string;
  sessionDay: string;
  sessionDate: string;
  sessionMonth: string;
  sessionTime: string;
  roomLabel: string;
  reserveCode: string;
  reserveDate: string;
  customerName: string;
  ticketCount: string;
  phone: string;
};

const CANCEL_FILTERS: { id: CancelFilter; label: string }[] = [
  { id: 'all', label: 'همه' },
  { id: 'urgent', label: 'فوری' },
  { id: 'overdue', label: 'موعد بررسی گذشته' },
];

const CANCEL_REQUESTS: CancelRequest[] = [
  {
    id: '1',
    category: 'urgent',
    title: 'لغو زیر 12 ساعت',
    badgeLabel: 'فوری',
    submittedAgo: '19ساعت پیش',
    sessionDay: 'پنج شنبه',
    sessionDate: '29',
    sessionMonth: 'شهریور',
    sessionTime: '17:40',
    roomLabel: 'موزه وارانسی(بازگشت)',
    reserveCode: '1234567',
    reserveDate: '1405.02.06 22:45',
    customerName: 'علیرضا فراری زاده',
    ticketCount: '5بلیت',
    phone: '09124447788',
  },
  {
    id: '2',
    category: 'urgent',
    title: 'لغو زیر 12 ساعت',
    badgeLabel: 'فوری',
    submittedAgo: '8ساعت پیش',
    sessionDay: 'جمعه',
    sessionDate: '30',
    sessionMonth: 'شهریور',
    sessionTime: '20:15',
    roomLabel: 'شب های تهران',
    reserveCode: '7654321',
    reserveDate: '1405.02.07 11:20',
    customerName: 'سارا محمدی',
    ticketCount: '3بلیت',
    phone: '09123334455',
  },
  {
    id: '3',
    category: 'overdue',
    title: 'موعد بررسی گذشته',
    submittedAgo: '2روز پیش',
    sessionDay: 'چهارشنبه',
    sessionDate: '28',
    sessionMonth: 'شهریور',
    sessionTime: '19:00',
    roomLabel: 'آزمایشگاه مرموز',
    reserveCode: '9081726',
    reserveDate: '1405.02.04 09:10',
    customerName: 'امیر حسینی',
    ticketCount: '4بلیت',
    phone: '09125556677',
  },
];

function CancelRequestCard({ request }: { request: CancelRequest }) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const detailsAnimation = useRef(new Animated.Value(0)).current;

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
    <View className="mt-8 overflow-hidden rounded-t-lg border border-[#E8EDF1] bg-[#EDF4FF]">
      <View className="flex flex-col items-start justify-start pt-5">
        <View className="flex flex-row justify-between w-full px-5">
          <View className="flex flex-row items-center gap-3">
            <Text
              className={`text-base font-extrabold ${
                request.category === 'urgent' ? 'text-[#F21543]' : 'text-[#BF9A00]'
              }`}
            >
              {request.title}
            </Text>
            {request.badgeLabel ? (
              <View className="h-5 w-[43px] flex items-center justify-center rounded-lg bg-[#F21543]">
                <Text className="text-sm font-extrabold text-white">{request.badgeLabel}</Text>
              </View>
            ) : null}
          </View>
          <View className="flex flex-row items-center rounded-lg bg-white px-2 py-1">
            <Hourglass width={20} height={20} />
            <Text className="text-base font-bold text-[#889BAD]">{request.submittedAgo}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5 px-5">
          <Text className="text-base font-bold text-[#09192D]">درخواست لغو</Text>
          <Text className="text-base font-bold text-[#889BAD]">سانس</Text>
          <Text className="text-base font-bold text-[#889BAD]">{request.sessionDay}</Text>
          <Text className="text-base font-bold text-[#FD7013]">{request.sessionDate}</Text>
          <Text className="text-base font-bold text-[#889BAD]">
            {request.sessionMonth}-{request.sessionTime}
          </Text>
        </View>

        <Text className="mt-3 px-5 text-base font-bold" numberOfLines={1}>
          <Text className="text-[#889BAD]">اتاق فرار </Text>
          <Text className="text-[#09192D]">{request.roomLabel}</Text>
        </Text>

        <View className="mb-5 mt-3 w-full flex-row items-center gap-4 px-5">
          <Pressable className="flex h-[40px] w-[94px] shrink-0 flex-row items-center justify-center rounded-lg bg-white px-2 py-1">
            <Text className="text-base font-bold text-[#9AA8B7]">رد کردن</Text>
          </Pressable>
          <Pressable className="min-w-0 flex-1 flex-row items-center justify-center rounded-lg bg-[#02C96F] px-2 py-1 h-[40px]">
            <Text className="text-base font-bold text-white">تایید و لغو سانس</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={toggleDetails}
        className="flex w-full items-center justify-center gap-2 rounded-b-lg border border-[#E8EDF1] pt-3.5"
        style={{ backgroundColor: '#FFFFFF' }}
        accessibilityRole="button"
        accessibilityLabel={detailsExpanded ? 'بستن' : 'مشاهده جزییات'}
      >
        <View className="flex flex-row items-center justify-center gap-2">
          <Text className="text-base font-bold text-[#0F172B]">
            {detailsExpanded ? 'بستن' : 'مشاهده جزییات'}
          </Text>
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
            <ArrowBottom width={18} height={18} />
          </Animated.View>
        </View>

        <Animated.View
          className="w-full overflow-hidden px-5"
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
          <View className="my-3 h-[1px] w-full bg-[#E4EBF0]" />

          <View className="mt-3 flex flex-col items-start justify-start">
            <View className="mb-10 flex w-full flex-row items-center justify-between">
              <View className="flex flex-row items-center justify-center gap-2">
                <Text className="text-base font-bold text-[#889BAD]">کد رزرو</Text>
                <Text className="text-base font-bold">{request.reserveCode}</Text>
              </View>

              <View className="flex flex-row items-center justify-center gap-2">
                <Text className="text-base font-bold text-[#889BAD]">تاریخ رزرو</Text>
                <Text className="text-base font-bold">{request.reserveDate}</Text>
              </View>
            </View>

            <View className="mb-4 flex w-full flex-row items-center justify-between">
              <View className="flex flex-row items-center justify-center gap-2">
                <Text className="text-base font-bold">{request.customerName}</Text>
              </View>

              <View className="flex flex-row items-center justify-center gap-2">
                <Text className="text-base font-bold text-[#889BAD]">تعداد</Text>
                <Text className="text-base font-bold">{request.ticketCount}</Text>
              </View>
            </View>

            <View className="flex w-full flex-row items-center justify-between">
              <Text className="text-base font-bold">{request.phone}</Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<CancelFilter>('all');

  const filteredRequests = CANCEL_REQUESTS.filter(
    (request) => activeFilter === 'all' || request.category === activeFilter,
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 130,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full flex flex-col items-center justify-start">
      <View className="mt-8 flex w-full flex-row items-center justify-between">
        <Text className="text-xl font-bold text-[#62748E]">درخواست ها</Text>
        <Pressable
          onPress={() => router.push('/(owner)/cancel-history')}
          className="flex w-[155px] flex-row justify-center gap-2 rounded-lg bg-[#F1F5F9] px-3 py-1"
          accessibilityRole="button"
          accessibilityLabel="تاریخچه لغو"
        >
          <Text className="text-base font-bold text-[#0F172B]">تاریخچه لغو</Text>
          <TimeIcon width={20} height={20} />
        </Pressable>
      </View>

      <View className="mt-5 flex flex-row items-start justify-start gap-2">
        <AttentionIcon width={20} height={20} />
        <Text className="text-sm font-bold text-[#BF9A00]">
          از بخش "تاریخچه لغو" می‌توانید تمام سوابق لغو و درخواست‌ها را مشاهده کنید.
        </Text>
      </View>

      <View className="flex h-[50px] w-full flex-row overflow-hidden rounded-lg bg-[#F1F5F9]">
        {CANCEL_FILTERS.map((filter, index) => {
          const isActive = activeFilter === filter.id;

          return (
            <Pressable
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              className={`flex-1 items-center justify-center px-2 ${
                isActive ? 'bg-[#FD7013]' : 'bg-transparent'
              } ${index === 0 ? 'rounded-l-lg' : ''} ${
                index === CANCEL_FILTERS.length - 1 ? 'rounded-r-lg' : ''
              }`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={filter.label}
            >
              <Text
                className={`text-center text-base font-bold ${
                  isActive ? 'text-white' : 'text-[#889BAD]'
                }`}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filteredRequests.length > 0 ? (
        filteredRequests.map((request) => (
          <CancelRequestCard key={request.id} request={request} />
        ))
      ) : (
        <View className="mt-8 w-full rounded-lg border border-[#E8EDF1] bg-[#F8FAFC] px-5 py-6">
          <Text className="text-center text-base font-bold text-[#889BAD]">
            درخواستی برای این فیلتر وجود ندارد.
          </Text>
        </View>
      )}
        </View>
      </ScrollView>
    </View>
  );
}
