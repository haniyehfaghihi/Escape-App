import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import ImgGame3 from "../../assets/images/comments/img-sample-profile.svg";
import ImgGame from "../../assets/images/manage-sanse/img-game.svg";
import ImgGame2 from "../../assets/images/manage-sanse/img-sample-2.svg";
import CancelRequestDecisionModal from "../../src/components/CancelRequestDecisionModal";
import CancelReservationModal from "../../src/components/CancelReservationModal";
import MonthCalendarModal from "../../src/components/MonthCalendarModal";
import DateItem, { DateItemData } from "../../src/components/DateItem";
import {
  Calender,
  HandDislikeIcon,
  HandLikeIcon,
  OwnerChevronLeftIcon,
  OwnerChevronRightIcon,
  OwnerSettingsIcon,
} from "../../src/components/icons";
import SessionCard, { SessionCardData } from "../../src/components/SessionCard";

const dayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  day: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
});

const SESSION_TIMES = [10, 12, 14, 16, 18, 20, 22, 24] as const;
const PLAYER_NAMES = [
  "سید حمید فراری زادگان",
  "علی رضایی",
  "سارا محمدی",
] as const;

const TOP_GAME_OPTIONS = [
  {
    id: "game-1",
    title: "ایستگاه شهر یخ",
    Image: ImgGame,
    activePlayerName: "سید حمید فراری زادگان",
    ticketCount: 5,
  },
  {
    id: "game-2",
    title: "مدوزا",
    Image: ImgGame2,
    activePlayerName: "علی رضایی",
    ticketCount: 4,
  },
  {
    id: "game-3",
    title: "کابوس نیمه‌شب",
    Image: ImgGame3,
    activePlayerName: "سارا محمدی",
    ticketCount: 6,
  },
] as const;

function hashString(value: string) {
  return value.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function createSessionByVariant(
  id: string,
  time: string,
  variant: "closed" | "open" | "reserved" | "cancel-request",
  seed: number,
  index: number,
): SessionCardData {
  if (variant === "closed") return { id, time, variant, title: "بسته" };
  if (variant === "open") return { id, time, variant, title: "باز" };
  if (variant === "reserved") {
    return {
      id,
      time,
      variant,
      title: PLAYER_NAMES[(seed + index) % PLAYER_NAMES.length],
    };
  }
  return {
    id,
    time,
    variant,
    title: "درخواست لغو سانس دارد",
    subtitle: PLAYER_NAMES[(seed + index + 1) % PLAYER_NAMES.length],
  };
}

function buildSessionsForDate(dateId: string, gameId: string): SessionCardData[] {
  const seed = hashString(`${gameId}|${dateId}`);
  const sessions = SESSION_TIMES.map((hour, index) => {
    const id = `${gameId}|${dateId}|${hour}`;
    const time = `${String(hour).padStart(2, "0")}:00`;
    const roll = (seed + hour + index * 11) % 100;
    let variant: "closed" | "open" | "reserved" | "cancel-request" = "open";
    if (roll < 30) variant = "closed";
    else if (roll < 60) variant = "open";
    else if (roll < 82) variant = "reserved";
    else variant = "cancel-request";
    return createSessionByVariant(id, time, variant, seed, index);
  });

  // تضمین: هر روز حداقل یک کارت قرمز درخواست لغو داشته باشد.
  if (!sessions.some((item) => item.variant === "cancel-request")) {
    const index = seed % sessions.length;
    const target = sessions[index];
    sessions[index] = createSessionByVariant(
      target.id,
      target.time,
      "cancel-request",
      seed,
      index,
    );
  }

  return sessions;
}

function getDateIdFromSessionId(sessionId: string) {
  if (sessionId.includes("|")) {
    const parts = sessionId.split("|");
    if (parts.length >= 3) return parts[1];
  }
  const separatorIndex = sessionId.lastIndexOf("-");
  if (separatorIndex <= 0) return null;
  return sessionId.slice(0, separatorIndex);
}

function getGameIdFromSessionId(sessionId: string) {
  if (sessionId.includes("|")) {
    const parts = sessionId.split("|");
    if (parts.length >= 3) return parts[0];
  }
  return null;
}

const DATE_STRIP_ITEM_WIDTH = 52;
const DATE_STRIP_GAP = 12;
const DATE_STRIP_PADDING = 8;

export default function Index() {
  const today = useMemo(() => new Date(), []);
  const todayId = useMemo(() => today.toISOString(), [today]);
  const [activeTopGameIndex, setActiveTopGameIndex] = useState(0);
  const [selectedDateId, setSelectedDateId] = useState<string>(() => todayId);
  const [selectedSession, setSelectedSession] =
    useState<SessionCardData | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2 | 3>(1);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedCancelRequestSession, setSelectedCancelRequestSession] =
    useState<SessionCardData | null>(null);
  const [
    isCancelRequestDecisionModalOpen,
    setIsCancelRequestDecisionModalOpen,
  ] = useState(false);
  const [playerFeedback, setPlayerFeedback] = useState<
    "like" | "dislike" | null
  >(null);
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState(false);

  const datesListRef = useRef<FlatList<DateItemData>>(null);

  const dates = useMemo<DateItemData[]>(() => {
    const baseDate = new Date(today);

    return Array.from({ length: 15 }, (_, index) => {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + index + 1);

      return {
        id: nextDate.toISOString(),
        day: dayFormatter.format(nextDate),
        label: weekdayFormatter.format(nextDate),
      };
    });
  }, [today]);
  const activeTopGame = TOP_GAME_OPTIONS[activeTopGameIndex];

  const sessionsByDate = useMemo(() => {
    const gameId = activeTopGame.id;
    const allDateIds = [todayId, ...dates.map((item) => item.id)];
    return allDateIds.reduce<Record<string, SessionCardData[]>>(
      (acc, dateId) => {
        acc[dateId] = buildSessionsForDate(dateId, gameId);
        return acc;
      },
      {},
    );
  }, [dates, todayId, activeTopGame.id]);
  const [sessionOverridesByGame, setSessionOverridesByGame] = useState<
    Record<string, Record<string, Record<string, SessionCardData>>>
  >({});

  const updateSessionVariant = (
    session: SessionCardData,
    nextVariant: "open" | "closed",
  ) => {
    const dateId = getDateIdFromSessionId(session.id);
    const gameId = getGameIdFromSessionId(session.id) ?? activeTopGame.id;
    if (!dateId) return;

    const updatedSession: SessionCardData = {
      ...session,
      variant: nextVariant,
      title: nextVariant === "open" ? "باز" : "بسته",
      subtitle: undefined,
    };

    setSessionOverridesByGame((prev) => {
      const prevGame = prev[gameId] ?? {};
      const prevForDate = prevGame[dateId] ?? {};
      return {
        ...prev,
        [gameId]: {
          ...prevGame,
          [dateId]: {
            ...prevForDate,
            [session.id]: updatedSession,
          },
        },
      };
    });
  };

  const handleReservedSessionPress = (item: SessionCardData) => {
    if (item.variant !== "reserved") {
      return;
    }

    setSelectedSession(item);
    setCancelReason("");
    setCancelStep(1);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancelStep(1);
    setCancelReason("");
    setSelectedSession(null);
  };

  const handleCancelRequestSessionPress = (item: SessionCardData) => {
    if (item.variant !== "cancel-request") {
      return;
    }

    setSelectedCancelRequestSession(item);
    setIsCancelRequestDecisionModalOpen(true);
  };

  const handleCloseCancelRequestDecisionModal = () => {
    setIsCancelRequestDecisionModalOpen(false);
    setSelectedCancelRequestSession(null);
  };

  const handleNextStep = () => {
    setCancelStep((prevStep) => {
      if (prevStep === 3 && !cancelReason.trim()) {
        return prevStep;
      }

      return Math.min(prevStep + 1, 3) as 1 | 2 | 3;
    });
  };

  const handlePrevStep = () => {
    setCancelStep((prevStep) => Math.max(prevStep - 1, 1) as 1 | 2 | 3);
  };

  const handleConfirmCancel = () => {
    if (!selectedSession) {
      return;
    }

    console.log("Reservation cancellation payload:", {
      sessionId: selectedSession.id,
      time: selectedSession.time,
      title: selectedSession.title,
      subtitle: selectedSession.subtitle ?? null,
      reason: cancelReason,
    });

    // لغو رزرو توسط مالک => سانس باید بسته شود.
    updateSessionVariant(selectedSession, "closed");

    handleCloseCancelModal();
  };

  const handleApproveCancelRequest = () => {
    if (!selectedCancelRequestSession) {
      return;
    }

    console.log("Cancel request approved:", {
      sessionId: selectedCancelRequestSession.id,
      time: selectedCancelRequestSession.time,
      title: selectedCancelRequestSession.title,
      subtitle: selectedCancelRequestSession.subtitle ?? null,
    });

    // تایید درخواست لغو پلیر => سانس دوباره باز می‌شود.
    updateSessionVariant(selectedCancelRequestSession, "open");

    handleCloseCancelRequestDecisionModal();
  };

  const handleRejectCancelRequest = () => {
    if (!selectedCancelRequestSession) {
      return;
    }

    console.log("Cancel request rejected:", {
      sessionId: selectedCancelRequestSession.id,
      time: selectedCancelRequestSession.time,
      title: selectedCancelRequestSession.title,
      subtitle: selectedCancelRequestSession.subtitle ?? null,
    });

    handleCloseCancelRequestDecisionModal();
  };

  const handleNextTopGame = () => {
    setActiveTopGameIndex(
      (prevIndex) => (prevIndex + 1) % TOP_GAME_OPTIONS.length,
    );
  };

  const handlePrevTopGame = () => {
    setActiveTopGameIndex(
      (prevIndex) =>
        (prevIndex - 1 + TOP_GAME_OPTIONS.length) % TOP_GAME_OPTIONS.length,
    );
  };

  const ActiveTopGameImage = activeTopGame.Image;
  const BottomSectionGameImage = activeTopGame.Image;

  useEffect(() => {
    setPlayerFeedback(null);
  }, [activeTopGame.id]);

  const effectiveDateId = useMemo(() => {
    return sessionsByDate[selectedDateId] ? selectedDateId : todayId;
  }, [selectedDateId, sessionsByDate, todayId]);
  const selectedDateBaseSessions = sessionsByDate[effectiveDateId] ?? [];
  const selectedDateOverrides =
    sessionOverridesByGame[activeTopGame.id]?.[effectiveDateId] ?? {};
  const selectedDateSessions = selectedDateBaseSessions.map(
    (session) => selectedDateOverrides[session.id] ?? session,
  );
  const sessionRows = useMemo(() => {
    const rows: SessionCardData[][] = [];
    for (let i = 0; i < selectedDateSessions.length; i += 2) {
      rows.push(selectedDateSessions.slice(i, i + 2));
    }
    return rows;
  }, [selectedDateSessions]);

  useEffect(() => {
    if (isMonthCalendarOpen) return;
    const targetId = effectiveDateId;
    if (targetId === todayId) return;
    const idx = dates.findIndex((d) => d.id === targetId);
    if (idx < 0) return;
    requestAnimationFrame(() => {
      datesListRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.45,
      });
    });
  }, [effectiveDateId, dates, todayId, isMonthCalendarOpen]);

  return (
    <>
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full self-stretch mb-8">
        <View className="w-full flex flex-row items-center justify-between mt-8">
          <View className="flex flex-row items-center justify-between">
            <ActiveTopGameImage width={61} height={76} />

            <View className="w-[120px] flex flex-col justify-center items-center gap-4">
              <Text
                className="text-base font-extrabold text-center"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {activeTopGame.title}
              </Text>

              <View className="flex flex-row items-center justify-between gap-4">
                <Pressable
                  className="w-6 h-6 border border-[#E8EDF1] flex justify-center items-center rounded-md"
                  onPress={handleNextTopGame}
                >
                  <OwnerChevronRightIcon width={7} height={12} />
                </Pressable>

                <Pressable
                  className="w-6 h-6 border border-[#E8EDF1] flex justify-center items-center rounded-md"
                  onPress={handlePrevTopGame}
                >
                  <OwnerChevronLeftIcon width={7} height={12} />
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable className="w-10 h-10 bg-[#F1F5F9] flex justify-center items-center rounded-md p-2">
            <OwnerSettingsIcon width={22} height={22} />
          </Pressable>
        </View>

        <View className="w-full h-[1px] bg-gray-hr my-8" />

        <View className="w-full flex-row items-center gap-3">
          <Pressable
            onPress={() => setIsMonthCalendarOpen(true)}
            className="w-[52px] h-[56px] border border-[#E8EDF1] flex justify-center items-center rounded-[10px] p-2"
            accessibilityRole="button"
            accessibilityLabel="تقویم"
          >
            <Calender width={7} height={12} />
          </Pressable>

          <Pressable
            className={`w-[52px] h-[56px] border flex justify-center items-center rounded-[10px] p-2 ${
              effectiveDateId === todayId
                ? "border-[#F75A13] bg-[#FC6F13]"
                : "border-[#E8EDF1] bg-white"
            }`}
            onPress={() => setSelectedDateId(todayId)}
            style={{
              shadowColor: effectiveDateId === todayId ? "#F75A13" : "#E8EDF1",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: effectiveDateId === todayId ? 0.35 : 1,
              shadowRadius: effectiveDateId === todayId ? 1 : 0,
              elevation: 1,
            }}
          >
            <Text
              className={`text-xl font-extrabold ${
                effectiveDateId === todayId ? "text-white" : "text-black"
              }`}
            >
              امروز
            </Text>
          </Pressable>

          <View className="flex-1">
            <FlatList
              ref={datesListRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={dates}
              extraData={effectiveDateId}
              keyExtractor={(item) => item.id}
              getItemLayout={(_, index) => ({
                length: DATE_STRIP_ITEM_WIDTH,
                offset:
                  DATE_STRIP_PADDING +
                  index * (DATE_STRIP_ITEM_WIDTH + DATE_STRIP_GAP),
                index,
              })}
              onScrollToIndexFailed={({ index, averageItemLength }) => {
                const stride =
                  averageItemLength ||
                  DATE_STRIP_ITEM_WIDTH + DATE_STRIP_GAP;
                datesListRef.current?.scrollToOffset({
                  offset: Math.max(0, index * stride),
                  animated: true,
                });
              }}
              contentContainerStyle={{
                alignItems: "center",
                gap: 12,
                paddingRight: 8,
              }}
              renderItem={({ item }) => (
                <DateItem
                  item={item}
                  isSelected={item.id === effectiveDateId}
                  onPress={(pressedDate: DateItemData) =>
                    setSelectedDateId(pressedDate.id)
                  }
                />
              )}
            />
          </View>
        </View>

        <View className="w-full mt-[30px] gap-7">
          {sessionRows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              className="w-full flex flex-row items-center justify-between gap-4"
            >
              {row.map((session) => (
                <SessionCard
                  key={session.id}
                  item={session}
                  onPress={(item) => {
                    if (item.variant === "open" || item.variant === "closed") {
                      updateSessionVariant(
                        item,
                        item.variant === "open" ? "closed" : "open",
                      );
                      return;
                    }

                    if (item.variant === "reserved") {
                      handleReservedSessionPress(item);
                      return;
                    }

                    if (item.variant === "cancel-request") {
                      handleCancelRequestSessionPress(item);
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </View>

        <View className="w-full h-[1px] bg-gray-hr my-8" />

        <View className="flex items-center justify-between w-full">
          <View className="flex flex-row items-center justify-between w-full">
            <View className="flex flex-row items-center gap-5">
              <BottomSectionGameImage width={34} height={42} />
              <Text className="text-base font-bold text-[#889BAD]">
                اتاق فرار
                <Text className="text-base font-bold text-black">
                  {activeTopGame.title}
                </Text>
              </Text>
            </View>

            <View className="flex flex-row items-center bg-[#E6FAF1] rounded-lg w-[86px] h-[30px] flex justify-center items-center">
              <Text className="text-base font-extrabold text-[#049654]">
                در حال بازی
              </Text>
            </View>
          </View>

          <View className="w-full  flex flex-row items-center justify-between mt-4">
            <View className="flex flex-row items-center">
              <Text className="text-base font-bold text-[#889BAD] mr-3">
                توسط
                <Text className="text-base font-bold text-black ">
                  {activeTopGame.activePlayerName}
                </Text>
              </Text>
            </View>
            <Text className="text-base font-bold ">
              {activeTopGame.ticketCount} بلیت
            </Text>
          </View>

          <View className="w-full h-[1px] bg-[#E4EBF0] my-4"></View>

          <TextInput
            className="w-full h-[100px] bg-[#F6F7F9] rounded-lg p-4 text-right border border-[#E8EDF1]"
            placeholder="دیدگاه خود را در مورد این پلیر بنویسید."
            placeholderTextColor="#889BAD"
            multiline
            textAlignVertical="top"
          />

          <View className="mb-2 mt-5 w-full flex-row items-center justify-center px-2">
            <Pressable
              className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2"
              onPress={() =>
                setPlayerFeedback((prev) => (prev === "like" ? null : "like"))
              }
              accessibilityRole="button"
              accessibilityState={{ selected: playerFeedback === "like" }}
            >
              <HandLikeIcon
                width={43}
                height={46}
                active={playerFeedback === "like"}
              />
              <Text
                className={`text-base font-bold ${
                  playerFeedback === "like" ? "text-[#02C96F]" : "text-black"
                }`}
              >
                راضی
              </Text>
            </Pressable>

            <Pressable
              className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2"
              onPress={() =>
                setPlayerFeedback((prev) =>
                  prev === "dislike" ? null : "dislike",
                )
              }
              accessibilityRole="button"
              accessibilityState={{ selected: playerFeedback === "dislike" }}
            >
              <HandDislikeIcon
                width={43}
                height={46}
                selected={playerFeedback === "dislike"}
              />
              <Text
                className={`text-base font-bold ${
                  playerFeedback === "dislike"
                    ? "text-[#F21543]"
                    : "text-[#889BAD]"
                }`}
              >
                ناراضی
              </Text>
            </Pressable>
          </View>

          <Pressable className="w-full h-12 bg-[#02C96F] rounded-lg flex justify-center items-center mt-8">
            <Text className="text-base font-extrabold text-white">
              ارسال دیدگاه
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>

    <CancelReservationModal
      visible={isCancelModalOpen}
      selectedSession={selectedSession}
      step={cancelStep}
      cancelReason={cancelReason}
      onReasonChange={setCancelReason}
      onClose={handleCloseCancelModal}
      onNext={handleNextStep}
      onBack={handlePrevStep}
      onConfirm={handleConfirmCancel}
    />
    <CancelRequestDecisionModal
      visible={isCancelRequestDecisionModalOpen}
      session={selectedCancelRequestSession}
      onClose={handleCloseCancelRequestDecisionModal}
      onApprove={handleApproveCancelRequest}
      onReject={handleRejectCancelRequest}
    />
    <MonthCalendarModal
      visible={isMonthCalendarOpen}
      onClose={() => setIsMonthCalendarOpen(false)}
      anchorDate={today}
      today={today}
      highlightDateId={effectiveDateId}
      onSelectDay={(dateId) => {
        setSelectedDateId(dateId);
        setIsMonthCalendarOpen(false);
      }}
    />
    </>
  );
}
