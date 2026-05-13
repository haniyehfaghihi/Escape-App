import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text, 
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BgWallet from "@/assets/images/wallet/bg-cart-wallet.svg";
import { ArrowLeft } from "@/src/components/icons/arrow-left";
import { WalletArrowDownIcon } from "@/src/components/icons/wallet-arrow-down";
import { WalletArrowUpIcon } from "@/src/components/icons/wallet-arrow-up";
import { WalletFilterIcon } from "@/src/components/icons/wallet-filter";
import { WalletInsightIcon } from "@/src/components/icons/wallet-insight";
import { WalletSuccessCheckIcon } from "@/src/components/icons/wallet-success-check";
import { WalletTransactionCreditIcon } from "@/src/components/icons/wallet-transaction-credit";
import { WalletTransactionDebitIcon } from "@/src/components/icons/wallet-transaction-debit";
import { ArrowBottom } from "@/src/components/icons/arrow-bottom";
import { normalizeToAsciiDigits } from "@/src/utils/inputSanitize";

type WalletSection = "settlements" | "transactions";

type WalletActivityStatus = "paid" | "processing" | "cancelled";

type WalletSettlementFilter = "all" | WalletActivityStatus;

type WalletTransactionTitle = (typeof WALLET_TRANSACTION_TITLES)[number];

type WalletTransactionFilter = "all" | WalletTransactionTitle;

type WalletTransactionDirection = "credit" | "debit";

type WalletSettlementItem = {
  id: string;
  section: "settlements";
  reservationCode: string;
  gameDate: string;
  amount: string;
  status: WalletActivityStatus;
};

type WalletTransactionItem = {
  id: string;
  section: "transactions";
  transactionCode: string;
  occurredAt: string;
  title: string;
  balanceBefore: string;
  transactionAmount: string;
  direction: WalletTransactionDirection;
  status: WalletActivityStatus;
};

type WalletActivityItem = WalletSettlementItem | WalletTransactionItem;

const WALLET_SECTIONS: { id: WalletSection; label: string }[] = [
  { id: "settlements", label: "لیست تسویه حساب" },
  { id: "transactions", label: "تراکنش های من" },
];

const WALLET_SETTLEMENT_FILTER_OPTIONS: {
  id: WalletSettlementFilter;
  label: string;
}[] = [
  { id: "all", label: "همه" },
  { id: "paid", label: "پرداخت شده" },
  { id: "processing", label: "در حال پردازش" },
  { id: "cancelled", label: "لغو شده" },
];

const WALLET_TRANSACTION_TITLES = [
  "افزایش موجودی",
  "تسویه حساب",
  "بازگشت وجه",
  "رزرو بازی",
] as const;

const WALLET_TRANSACTION_FILTER_OPTIONS: {
  id: WalletTransactionFilter;
  label: string;
}[] = [
  { id: "all", label: "همه" },
  ...WALLET_TRANSACTION_TITLES.map((title) => ({
    id: title,
    label: title,
  })),
];

const WALLET_ACTIVITY_STATUS_STYLES: Record<
  WalletActivityStatus,
  { containerClassName: string; textClassName: string; label: string }
> = {
  paid: {
    containerClassName: "bg-[#E6F4EE]",
    textClassName: "text-[#049654]",
    label: "پرداخت شده",
  },
  processing: {
    containerClassName: "bg-[#FFF1E7]",
    textClassName: "text-[#FD7013]",
    label: "در حال پردازش",
  },
  cancelled: {
    containerClassName: "bg-[#FEE8EC]",
    textClassName: "text-[#F21543]",
    label: "لغو شده",
  },
};

const WALLET_ACTIVITY_STATUS_CYCLE: WalletActivityStatus[] = [
  "paid",
  "processing",
  "cancelled",
];

const MOCK_WALLET_ACTIVITIES: WalletActivityItem[] = [
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `settlement-${index + 1}`,
    section: "settlements" as const,
    reservationCode: String(1234567 + index),
    gameDate: `1405.06.${String(20 + index).padStart(2, "0")} ${String(18 + index).padStart(2, "0")}:30`,
    amount: (2_550_000 + index * 125_000).toLocaleString("en-US"),
    status: WALLET_ACTIVITY_STATUS_CYCLE[index % WALLET_ACTIVITY_STATUS_CYCLE.length],
  })),
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `transaction-${index + 1}`,
    section: "transactions" as const,
    transactionCode: String(2234567 + index),
    occurredAt: `1405.07.${String(1 + index).padStart(2, "0")} ${String(10 + index).padStart(2, "0")}:15`,
    title: WALLET_TRANSACTION_TITLES[index % WALLET_TRANSACTION_TITLES.length],
    balanceBefore: (185_000 + index * 10_000).toLocaleString("en-US"),
    transactionAmount: (112_500 + index * 5_000).toLocaleString("en-US"),
    direction: (index % 2 === 0 ? "credit" : "debit") as WalletTransactionDirection,
    status:
      WALLET_ACTIVITY_STATUS_CYCLE[
        (index + 1) % WALLET_ACTIVITY_STATUS_CYCLE.length
      ],
  })),
];

function formatTomans(n: number): string {
  try {
    return n.toLocaleString("fa-IR");
  } catch {
    return String(n);
  }
}

function parseAmountDigits(text: string): number {
  const digits = normalizeToAsciiDigits(text);
  if (!digits) return 0;
  return Number(digits);
}

function WalletAmountInput({
  className,
  value,
  onChangeText,
  placeholder,
  ...props
}: TextInputProps) {
  const digits = normalizeToAsciiDigits(String(value ?? ""));
  const showPlaceholder = !digits && Boolean(placeholder);
  const formattedHint =
    digits.length > 0 ? `${formatTomans(Number(digits))} تومان` : null;

  return (
    <View className={`${className ?? "w-full"}`}>
      <View className="relative w-full">
        <TextInput
          {...props}
          value={digits}
          onChangeText={(text) => onChangeText?.(normalizeToAsciiDigits(text))}
          placeholder=""
          className="h-[50px] w-full rounded-lg bg-white px-4 font-bold"
          style={{
            fontSize: 20,
            color: "#04B968",
            textAlign: "left",
            writingDirection: "ltr",
          }}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        {showPlaceholder ? (
          <Text
            pointerEvents="none"
            numberOfLines={1}
            className="absolute left-4 right-4 font-bold text-[#889BAD]"
            style={{ top: 0, height: 50, lineHeight: 50, fontSize: 16 }}
          >
            {placeholder}
          </Text>
        ) : null}
      </View>
      {formattedHint ? (
        <Text
          className="mt-1 px-1 text-xs font-bold text-[#889BAD]"
          style={{ textAlign: "right" }}
        >
          {formattedHint}
        </Text>
      ) : null}
    </View>
  );
}

function WalletSettlementCard({ activity }: { activity: WalletSettlementItem }) {
  const statusStyle = WALLET_ACTIVITY_STATUS_STYLES[activity.status];

  return (
    <View className="flex border-b border-[#E2E8F0] pb-5">
      <View className="mt-5 flex w-full flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-3">
          <Text className="text-sm font-bold text-[#889BAD]">کد رزرو</Text>
          <Text className="text-sm font-bold">{activity.reservationCode}</Text>
        </View>

        <View className="flex flex-row items-center gap-3">
          <Text className="text-sm font-bold text-[#889BAD]">تاریخ بازی</Text>
          <Text className="text-sm font-bold">{activity.gameDate}</Text>
        </View>
      </View>

      <View className="mt-5 flex w-full flex-row items-center justify-between">
        <View className="flex flex-row items-center gap-3">
          <Text className="text-sm font-bold text-[#889BAD]">مبلغ</Text>
          <Text className="text-sm font-bold">{activity.amount}</Text>
        </View>

        <Pressable
          className={`w-[181px] items-center justify-center rounded-lg px-4 py-2 ${statusStyle.containerClassName}`}
        >
          <Text className={`text-sm font-bold ${statusStyle.textClassName}`}>
            {statusStyle.label}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function WalletTransactionCard({ activity }: { activity: WalletTransactionItem }) {
  const isCredit = activity.direction === "credit";
  const codeColorClass = isCredit ? "text-[#049654]" : "text-[#F21543]";

  return (
    <View className="flex flex-col border-b border-[#E2E8F0] pb-5">

      <View className="flex flex-row mt-5 items-center justify-between">

        <View className="flex flex-row items-center gap-3">
          {isCredit ? (
            <WalletTransactionCreditIcon width={38} height={38} />
          ) : (
            <WalletTransactionDebitIcon width={38} height={38} />
          )}
          <Text className={`text-base font-bold ${codeColorClass}`}>
            {activity.transactionCode}
          </Text>
        </View>

        <View className="mt-3 h-px w-[113px] bg-[#E2E8F0]" />

        <Text className="mt-3 text-base font-bold text-[#4E5C6D]">
          {activity.occurredAt}
        </Text>
      </View>

      <View className="mt-6 flex w-full flex-row items-center justify-between">
        <View className="flex flex-col gap-1">
          <Text className="text-sm font-bold text-[#889BAD]">عنوان</Text>
          <Text className="text-sm font-bold">{activity.title}</Text>
        </View>

        <View className="flex flex-col gap-1">
          <Text className="text-sm font-bold text-[#889BAD]">موجودی قبل</Text>
          <Text className="text-sm font-bold">{activity.balanceBefore}</Text>
        </View>

        <View className="flex flex-col gap-1">
          <Text className="text-sm font-bold text-[#889BAD]">مقدار</Text>
          <Text className="text-sm font-bold">{activity.transactionAmount}</Text>
        </View>
      </View>
    </View>
  );
}


export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] =
    useState<WalletSection>("settlements");
  const [isTopUpExpanded, setIsTopUpExpanded] = useState(false);
  const [isWithdrawalExpanded, setIsWithdrawalExpanded] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [topUpSuccessVisible, setTopUpSuccessVisible] = useState(false);
  const [withdrawalSuccessVisible, setWithdrawalSuccessVisible] =
    useState(false);
  const [settlementFilter, setSettlementFilter] =
    useState<WalletSettlementFilter>("all");
  const [transactionFilter, setTransactionFilter] =
    useState<WalletTransactionFilter>("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const topUpSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const withdrawalSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const activeSectionLabel =
    WALLET_SECTIONS.find((section) => section.id === activeSection)?.label ??
    "لیست تسویه حساب";
  const sectionActivities = MOCK_WALLET_ACTIVITIES.filter(
    (activity) => activity.section === activeSection,
  );
  const activeFilterOptions =
    activeSection === "transactions"
      ? WALLET_TRANSACTION_FILTER_OPTIONS
      : WALLET_SETTLEMENT_FILTER_OPTIONS;
  const activeFilter =
    activeSection === "transactions" ? transactionFilter : settlementFilter;
  const filteredSectionActivities = sectionActivities.filter((activity) => {
    if (activeFilter === "all") return true;

    if (activity.section === "transactions") {
      return activity.title === activeFilter;
    }

    return activity.status === activeFilter;
  });
  const hasWalletActivity = sectionActivities.length > 0;
  const activeFilterLabel =
    activeFilterOptions.find((option) => option.id === activeFilter)?.label ??
    "همه";

  const showTopUpSuccess = () => {
    setTopUpSuccessVisible(true);
    if (topUpSuccessTimeoutRef.current) {
      clearTimeout(topUpSuccessTimeoutRef.current);
    }
    topUpSuccessTimeoutRef.current = setTimeout(() => {
      setTopUpSuccessVisible(false);
      topUpSuccessTimeoutRef.current = null;
    }, 5000);
  };

  const showWithdrawalSuccess = () => {
    setWithdrawalSuccessVisible(true);
    if (withdrawalSuccessTimeoutRef.current) {
      clearTimeout(withdrawalSuccessTimeoutRef.current);
    }
    withdrawalSuccessTimeoutRef.current = setTimeout(() => {
      setWithdrawalSuccessVisible(false);
      withdrawalSuccessTimeoutRef.current = null;
    }, 5000);
  };

  const handleTopUpSubmit = () => {
    const amount = parseAmountDigits(topUpAmount);
    if (!amount) return;

    setWalletBalance((prev) => prev + amount);
    showTopUpSuccess();
    setTopUpAmount("");
    setIsTopUpExpanded(false);
  };

  const handleWithdrawalSubmit = () => {
    const amount = parseAmountDigits(withdrawalAmount);
    if (!amount) return;

    setWalletBalance((prev) => Math.max(0, prev - amount));
    showWithdrawalSuccess();
    setWithdrawalAmount("");
    setIsWithdrawalExpanded(false);
  };

  const handleUseFullBalance = () => {
    setWithdrawalAmount(walletBalance > 0 ? String(walletBalance) : "");
  };

  useEffect(() => {
    setIsFilterMenuOpen(false);
    setSettlementFilter("all");
    setTransactionFilter("all");
  }, [activeSection]);

  useEffect(() => {
    return () => {
      if (topUpSuccessTimeoutRef.current) {
        clearTimeout(topUpSuccessTimeoutRef.current);
      }
      if (withdrawalSuccessTimeoutRef.current) {
        clearTimeout(withdrawalSuccessTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-white">

      

      <ScrollView
        style={{ flex: 1, marginTop: 24 }}
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 130,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full items-center mb-5 ">
          <View className="relative w-[260px] h-[168px]">
            <BgWallet width={260} height={168} />
            <View className="absolute left-5 top-4 items-start gap-2 flex flex-row items-center justify-center">
              <WalletInsightIcon width={32} height={20} />
              <Text className="text-sm font-extrabold text-white">
                زوم کارت
              </Text>
            </View>

            <View className="flex items-center justify-between absolute bottom-8 left-0 right-0 gap-3">
              <Text className="text-sm font-extrabold text-white">
                IR 5423100020541250000010111
              </Text>
              <Text className="text-sm font-extrabold text-white">
                علیرضا اتاق فراری نژاد
              </Text>
              <Text className="text-sm font-extrabold text-white">
                {formatTomans(walletBalance)}{" "}
                <Text className="text-sm font-extrabold text-[#FD7013]">
                  تومان
                </Text>
              </Text>
            </View>
          </View>

          <View className="mt-5 w-full rounded-lg bg-[#EDF2F5]">
            <Pressable
              onPress={() => setIsTopUpExpanded((prev) => !prev)}
              className="flex w-full flex-row items-center justify-between p-4"
              accessibilityRole="button"
              accessibilityState={{ expanded: isTopUpExpanded }}
              accessibilityLabel="افزایش موجودی"
            >
              <View className="flex flex-row items-center gap-2">
                <WalletArrowUpIcon width={21} height={21} />
                <Text className="text-sm font-extrabold text-[#5091FB]">
                  افزایش موجودی
                </Text>
              </View>
              <View
                style={{
                  transform: [
                    { rotate: isTopUpExpanded ? "180deg" : "0deg" },
                  ],
                }}
              >
                <ArrowBottom width={18} height={18} />
              </View>
            </Pressable>

            {isTopUpExpanded ? (
              <View className="w-full gap-4 px-4 pb-4">
                <WalletAmountInput
                  value={topUpAmount}
                  onChangeText={setTopUpAmount}
                  placeholder="مبلغ درخواست افزایش"
                  onSubmitEditing={handleTopUpSubmit}
                />

                <Pressable
                  className="flex h-[50px] w-full items-center justify-center rounded-lg bg-[#1ED982] px-4 py-2"
                  onPress={handleTopUpSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="پرداخت"
                >
                  <Text className="text-base font-extrabold text-white">
                    پرداخت
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <View className="mt-5 w-full rounded-lg bg-[#EDF2F5]">
            <Pressable
              onPress={() => setIsWithdrawalExpanded((prev) => !prev)}
              className="flex w-full flex-row items-center justify-between p-4"
              accessibilityRole="button"
              accessibilityState={{ expanded: isWithdrawalExpanded }}
              accessibilityLabel="تسویه حساب"
            >
              <View className="flex flex-row items-center gap-2">
                <WalletArrowDownIcon width={21} height={21} />
                <Text className="text-sm font-extrabold text-[#5091FB]">
                  تسویه حساب
                </Text>
              </View>
              <View
                style={{
                  transform: [
                    { rotate: isWithdrawalExpanded ? "180deg" : "0deg" },
                  ],
                }}
              >
                <ArrowBottom width={18} height={18} />
              </View>
            </Pressable>

            {isWithdrawalExpanded ? (
              <View className="w-full gap-4 px-4 pb-4">
                <View className="w-full flex-row items-center gap-2">
                  <Pressable
                    onPress={handleUseFullBalance}
                    className="shrink-0 items-center justify-center rounded-lg bg-[#FD7013] p-2"
                    accessibilityRole="button"
                    accessibilityLabel="کل موجودی"
                  >
                    <Text className="text-sm font-extrabold text-white">کل</Text>
                    <Text className="text-sm font-extrabold text-white">
                      موجودی
                    </Text>
                  </Pressable>

                  <WalletAmountInput
                    value={withdrawalAmount}
                    onChangeText={setWithdrawalAmount}
                    placeholder="مبلغ درخواست برداشت"
                    onSubmitEditing={handleWithdrawalSubmit}
                    className="min-w-0 flex-1"
                  />
                </View>

                <Pressable
                  className="flex h-[50px] w-full items-center justify-center rounded-lg bg-[#1ED982] px-4 py-2"
                  onPress={handleWithdrawalSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="پرداخت"
                >
                  <Text className="text-base font-extrabold text-white">
                    پرداخت
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {topUpSuccessVisible || withdrawalSuccessVisible ? (
            <View className="mt-5 w-full gap-2">
              {topUpSuccessVisible ? (
                <View className="flex w-full flex-row items-center justify-start gap-1">
                  <WalletSuccessCheckIcon width={12} height={8} />
                  <Text className="text-sm font-bold text-[#04B968]">
                    درخواست افزایش موجودی حساب با موفقیت ثبت شد.
                  </Text>
                </View>
              ) : null}
              {withdrawalSuccessVisible ? (
                <View className="flex w-full flex-row items-center justify-start gap-1">
                  <WalletSuccessCheckIcon width={12} height={8} />
                  <Text className="text-sm font-bold text-[#04B968]">
                    درخواست تسویه حساب با موفقیت ثبت شد.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="mt-[60px] h-[50px] w-full flex-row overflow-hidden rounded-lg bg-[#F1F5F9]">
            {WALLET_SECTIONS.map((section, index) => {
              const isActive = activeSection === section.id;

              return (
                <Pressable
                  key={section.id}
                  onPress={() => setActiveSection(section.id)}
                  className={`flex-1 items-center justify-center px-2 border border-[#E2E8F0] ${
                    isActive ? "bg-[#FF6900]" : "bg-white"
                  } ${index === 0 ? "rounded-l-lg" : ""} ${
                    index === WALLET_SECTIONS.length - 1 ? "rounded-r-lg" : ""
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={section.label}
                >
                  <Text
                    numberOfLines={1}
                    className={`shrink-0 text-center text-sm font-extrabold ${
                      isActive ? "text-white" : "text-[#889BAD]"
                    }`}
                  >
                    {section.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-5 flex w-full flex-row items-center justify-between">
            <Text className="text-lg font-bold">{activeSectionLabel}</Text>
            <View className="relative z-20">
              <Pressable
                onPress={() => setIsFilterMenuOpen((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="فیلتر"
                accessibilityState={{ expanded: isFilterMenuOpen }}
              >
                <WalletFilterIcon width={22} height={22} />
              </Pressable>

              {isFilterMenuOpen ? (
                <View className="absolute right-0 top-full mt-2 min-w-[156px] overflow-hidden rounded-lg border border-[#E2E8F0] bg-white py-1">
                  {activeFilterOptions.map((option) => {
                    const isSelected = activeFilter === option.id;

                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          if (activeSection === "transactions") {
                            setTransactionFilter(option.id as WalletTransactionFilter);
                          } else {
                            setSettlementFilter(option.id as WalletSettlementFilter);
                          }
                          setIsFilterMenuOpen(false);
                        }}
                        className={`px-3 py-2 ${isSelected ? "bg-[#FFF1E7]" : "bg-white"}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={option.label}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            isSelected ? "text-[#FF6900]" : "text-[#0F172B]"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>

          {hasWalletActivity ? (
            filteredSectionActivities.length > 0 ? (
              filteredSectionActivities.map((activity) =>
                activity.section === "transactions" ? (
                  <WalletTransactionCard
                    key={activity.id}
                    activity={activity}
                  />
                ) : (
                  <WalletSettlementCard key={activity.id} activity={activity} />
                ),
              )
            ) : (
              <Text className="mt-8 text-sm font-bold text-[#90A1B9]">
                موردی برای «{activeFilterLabel}» وجود ندارد.
              </Text>
            )
          ) : (
            <Text className="mt-8 text-sm font-bold text-[#90A1B9]">
              شما تاکنون در کیف پول فعالیت نداشته اید.
            </Text>
          )}
        </View> 
      </ScrollView>
    </View>
  );
}
