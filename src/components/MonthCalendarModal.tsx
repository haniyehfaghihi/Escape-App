import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CloseIcon } from "@/src/components/icons/close";
import {
  OwnerChevronLeftIcon,
  OwnerChevronRightIcon,
} from "@/src/components/icons";

const monthTitleFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "long",
  year: "numeric",
});

const weekdayShortFormatter = new Intl.DateTimeFormat("fa-IR", {
  weekday: "short",
});

const dayNumFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  day: "numeric",
});

/** همان الگوی `id` روزها در صفحهٔ اصلی: زمان محلی از `anchor` حفظ می‌شود. */
export function makeDateIdFromLocalDay(
  anchor: Date,
  year: number,
  month: number,
  day: number,
): string {
  const d = new Date(
    year,
    month,
    day,
    anchor.getHours(),
    anchor.getMinutes(),
    anchor.getSeconds(),
    anchor.getMilliseconds(),
  );
  return d.toISOString();
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** ستون ۰ = شنبه (هم‌تراز با تقویم رایج ایران). */
function leadingEmptyCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  return (firstWeekday + 1) % 7;
}

const WEEKDAY_HEADER_BASE = new Date(2023, 8, 23);

const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(WEEKDAY_HEADER_BASE);
  d.setDate(WEEKDAY_HEADER_BASE.getDate() + i);
  return weekdayShortFormatter.format(d);
});

type Cursor = { year: number; month: number };

type MonthCalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  /** مرجع زمان روز (مثل `today` در صفحهٔ مالک) برای ساخت `id` هم‌خوان با `sessionsByDate`. */
  anchorDate: Date;
  /** برای تشخیص «امروز» و حاشیهٔ نارنجی وقتی انتخاب‌شده نیست. */
  today: Date;
  /** روزی که در صفحهٔ اصلی انتخاب شده (مثلاً همان `effectiveDateId`) — پس از باز کردن مودال همان ماه و پس‌زمینهٔ نارنجی. */
  highlightDateId: string;
  onSelectDay: (dateId: string) => void;
};

export default function MonthCalendarModal({
  visible,
  onClose,
  anchorDate,
  today,
  highlightDateId,
  onSelectDay,
}: MonthCalendarModalProps) {
  const [cursor, setCursor] = useState<Cursor>(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  useEffect(() => {
    if (!visible) return;
    const d = new Date(highlightDateId);
    if (!Number.isNaN(d.getTime())) {
      setCursor({ year: d.getFullYear(), month: d.getMonth() });
    } else {
      setCursor({
        year: today.getFullYear(),
        month: today.getMonth(),
      });
    }
  }, [visible, highlightDateId, today]);

  const monthTitle = useMemo(
    () =>
      monthTitleFormatter.format(new Date(cursor.year, cursor.month, 1)),
    [cursor.year, cursor.month],
  );

  const dim = daysInMonth(cursor.year, cursor.month);
  const lead = leadingEmptyCells(cursor.year, cursor.month);
  const totalSlots = lead + dim;
  const paddedRows = Math.ceil(totalSlots / 7);

  const goPrevMonth = () => {
    setCursor(({ year, month }) =>
      month === 0
        ? { year: year - 1, month: 11 }
        : { year, month: month - 1 },
    );
  };

  const goNextMonth = () => {
    setCursor(({ year, month }) =>
      month === 11
        ? { year: year + 1, month: 0 }
        : { year, month: month + 1 },
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-end bg-black/45">
          <Pressable
            className="absolute inset-0"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="بستن"
          />

          <View className="w-full rounded-t-3xl bg-white px-5 pb-8 pt-4">
            <View className="mb-4 w-full flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#0F172B]">
                تقویم
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="بستن"
              >
                <CloseIcon width={20} height={20} />
              </Pressable>
            </View>

            <View className="mb-3 w-full flex-row items-center justify-between px-1">
            <Pressable
                onPress={goPrevMonth}
                className="h-10 w-10 items-center justify-center rounded-lg border border-[#E8EDF1]"
                accessibilityRole="button"
                accessibilityLabel="ماه بعد"
              >
                <OwnerChevronRightIcon width={9} height={14} />
              </Pressable>
              <Text className="text-base font-bold text-[#889BAD]">
                {monthTitle}
              </Text>
              <Pressable
                onPress={goNextMonth}
                className="h-10 w-10 items-center justify-center rounded-lg border border-[#E8EDF1]"
                accessibilityRole="button"
                accessibilityLabel="ماه قبل"
              >
                <OwnerChevronLeftIcon width={9} height={14} />
              </Pressable>
            </View>

            <View className="mb-2 w-full flex-row">
              {weekdayLabels.map((label) => (
                <View key={label} className="min-w-0 flex-1 items-center py-1">
                  <Text
                    className="text-[10px] font-bold text-[#889BAD]"
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {Array.from({ length: paddedRows }, (_, row) => (
              <View
                key={`row-${cursor.year}-${cursor.month}-${row}`}
                className="mb-1 w-full flex-row gap-1"
              >
                {Array.from({ length: 7 }, (_, col) => {
                  const i = row * 7 + col;
                  if (i < lead || i >= lead + dim) {
                    return (
                      <View
                        key={`e-${i}`}
                        className="min-h-[52px] min-w-0 flex-1"
                      />
                    );
                  }
                  const day = i - lead + 1;
                  const cellDate = new Date(cursor.year, cursor.month, day);
                  const isToday = isSameLocalDay(cellDate, today);
                  const highlightDate = new Date(highlightDateId);
                  const isValidHighlight = !Number.isNaN(highlightDate.getTime());
                  const isSelectedDay =
                    isValidHighlight && isSameLocalDay(cellDate, highlightDate);
                  const dateId = makeDateIdFromLocalDay(
                    anchorDate,
                    cursor.year,
                    cursor.month,
                    day,
                  );

                  const filledOrange = isSelectedDay;
                  const todayRing = isToday && !isSelectedDay;

                  return (
                    <Pressable
                      key={dateId}
                      onPress={() => onSelectDay(dateId)}
                      className={`min-h-[52px] min-w-0 flex-1 items-center justify-center rounded-lg border px-0.5 py-1 ${
                        filledOrange
                          ? "border-[#F75A13] bg-[#FC6F13]"
                          : todayRing
                            ? "border-[#F75A13] bg-white"
                            : "border-[#E8EDF1] bg-white"
                      }`}
                      accessibilityRole="button"
                      accessibilityLabel={`روز ${dayNumFormatter.format(cellDate)}`}
                      accessibilityState={{ selected: isSelectedDay }}
                    >
                      <Text
                        className={`text-base font-extrabold ${
                          filledOrange ? "text-white" : "text-black"
                        }`}
                      >
                        {dayNumFormatter.format(cellDate)}
                      </Text>
                      <Text
                        className={`text-[8px] font-bold ${
                          filledOrange ? "text-white" : "text-[#889BAD]"
                        }`}
                        numberOfLines={1}
                      >
                        {weekdayShortFormatter.format(cellDate)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
