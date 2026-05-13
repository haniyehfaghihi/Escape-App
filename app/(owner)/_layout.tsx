import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import Header from "../../src/components/Header";
import {
  markAllCancellRequestsSeen,
  ownerHasUnreadCancellRequests,
} from "./cancell";

const SHEET_HEIGHT = 220;
type FinanceSection = "my-sales" | "discount-code" | "affiliate";

function OwnerTabBarBackground() {
  const tabBarPath =
    "M220 6C229.686 6 238.714 8.84044 246.316 13.7403C250.435 16.3956 255.075 18.3398 259.976 18.3398H415C426.046 18.3398 435 27.2941 435 38.3398V94.3398C435 105.386 426.046 114.34 415 114.34H25C13.9543 114.34 5 105.386 5 94.3398V38.3398C5 27.2941 13.9543 18.3398 25 18.3398H180.024C184.925 18.3398 189.565 16.3956 193.684 13.7403C201.286 8.84044 210.314 6 220 6Z";

  return (
    <View
      style={{
        flex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 6,
      }}
      pointerEvents="none"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 440 119"
        preserveAspectRatio="none"
      >
        <Path
          d={tabBarPath}
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth={6}
        />
        <Path
          d={tabBarPath}
          fill="none"
          stroke="rgba(0, 0, 0, 0.03)"
          strokeWidth={3}
        />
        <Path d={tabBarPath} fill="white" />
      </Svg>
    </View>
  );
}

export default function OwnerLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [isFinanceSheetOpen, setIsFinanceSheetOpen] = useState(false);
  const [hasUnreadCancell, setHasUnreadCancell] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const refreshCancellUnread = useCallback(async () => {
    try {
      setHasUnreadCancell(await ownerHasUnreadCancellRequests());
    } catch {
      setHasUnreadCancell(false);
    }
  }, []);

  useEffect(() => {
    if (pathname.includes("cancell")) {
      void markAllCancellRequestsSeen();
      setHasUnreadCancell(false);
      return;
    }
    void refreshCancellUnread();
  }, [pathname, refreshCancellUnread]);

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state === "active" && !pathname.includes("cancell")) {
        void refreshCancellUnread();
      }
    };
    const sub = AppState.addEventListener("change", onAppState);
    return () => sub.remove();
  }, [pathname, refreshCancellUnread]);

  const financeItems = useMemo(
    () => [
      {
        key: "my-sales" as FinanceSection,
        label: "فروش های من",
        icon: "trending-up-outline" as const,
      },
      {
        key: "discount-code" as FinanceSection,
        label: "ایجاد کد تخفیف",
        icon: "pricetag-outline" as const,
      },
      {
        key: "affiliate" as FinanceSection,
        label: "همکاری در فروش",
        icon: "git-network-outline" as const,
      },
    ],
    [],
  );

  const closeFinanceSheet = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsFinanceSheetOpen(false);
    });
  };

  const openFinanceSheet = () => {
    if (!isFinanceSheetOpen) setIsFinanceSheetOpen(true);

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectFinanceSection = (section: FinanceSection) => {
    closeFinanceSheet();
    router.push({ pathname: "/(owner)/sales", params: { section } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Tabs
        screenOptions={{
          header: () => <Header />,
          sceneStyle: {
            flex: 1,
            backgroundColor: "#FFFFFF",
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#FC6F13",
          tabBarInactiveTintColor: "#8e8e93",
          tabBarStyle: {
            backgroundColor: "transparent",
            position: "absolute",
            height: 96 + insets.bottom,
            paddingTop: 10,
            paddingBottom: insets.bottom,
            borderTopWidth: 0,
            elevation: 0,
            zIndex: 1,
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 18,
            paddingBottom: 2,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
          tabBarLabelStyle: {
            color: "#8e8e93",
            fontSize: 11,
            marginTop: 0,
          },
          tabBarBackground: () => <OwnerTabBarBackground />,
        }}
      >
        <Tabs.Screen
          name="wallet"
          options={{
            title: "کیف پول",
            tabBarIcon: ({ color, size }) => (
              <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
                <Path
                  d="M24.4579 10.5013C24.3669 8.3173 24.0752 6.97797 23.1314 6.0353C21.7652 4.66797 19.5649 4.66797 15.1654 4.66797H11.6654C7.26587 4.66797 5.06553 4.66797 3.69936 6.0353C2.3332 7.40264 2.33203 9.6018 2.33203 14.0013C2.33203 18.4008 2.33203 20.6011 3.69936 21.9673C5.0667 23.3335 7.26587 23.3346 11.6654 23.3346H15.1654C19.5649 23.3346 21.7652 23.3346 23.1314 21.9673C24.0752 21.0246 24.368 19.6853 24.4579 17.5013"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Path
                  d="M24.3052 10.5H21.2695C19.187 10.5 17.5 12.0668 17.5 14C17.5 15.9332 19.1882 17.5 21.2683 17.5H24.3052C24.4032 17.5 24.451 17.5 24.4918 17.4977C25.1218 17.4592 25.6235 16.9937 25.6643 16.4092C25.6667 16.3718 25.6667 16.3263 25.6667 16.2365V11.7635C25.6667 11.6737 25.6667 11.6282 25.6643 11.5908C25.6223 11.0063 25.1218 10.5408 24.4918 10.5023C24.451 10.5 24.4032 10.5 24.3052 10.5Z"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Path
                  d="M7 9.33594H11.6667"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M20.9883 14H20.9997"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ),
          }}
        />
        <Tabs.Screen
          name="cancell"
          options={{
            title: "کنسلی ها",
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  width: size,
                  height: size,
                  position: "relative",
                }}
              >
                <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M6.6385 1.68367C7.07598 1.24605 7.66938 1.00013 8.28817 1H15.2952C15.914 1.00013 16.5073 1.24605 16.9448 1.68367L21.8997 6.6385C22.3373 7.07598 22.5832 7.66938 22.5833 8.28817V15.2952C22.5832 15.914 22.3373 16.5073 21.8997 16.9448L16.9448 21.8997C16.5073 22.3373 15.914 22.5832 15.2952 22.5833H8.28817C7.66938 22.5832 7.07598 22.3373 6.6385 21.8997L1.68367 16.9448C1.24605 16.5073 1.00013 15.914 1 15.2952V8.28817C1.00013 7.66938 1.24605 7.07598 1.68367 6.6385L6.6385 1.68367Z"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M8 8L15.5833 15.5833M15.5833 8L8 15.5833"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                {hasUnreadCancell ? (
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: -2,
                      bottom: -1,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: "#FC6F13",
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  />
                ) : null}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "مدیریت سانس",
            tabBarIcon: ({ color, size }) => (
              <Svg width={size} height={size} viewBox="0 0 34 34" fill="none">
                <Rect
                  width={34}
                  height={34}
                  transform="matrix(-1 0 0 1 34 0)"
                  fill="white"
                />
                <Path
                  d="M7.08333 19.832H26.9167C28.4815 19.832 29.75 21.1006 29.75 22.6654V26.9154C29.75 28.4802 28.4815 29.7487 26.9167 29.7487H7.08333C5.51853 29.7487 4.25 28.4802 4.25 26.9154V22.6654C4.25 21.1006 5.51853 19.832 7.08333 19.832Z"
                  stroke={color}
                  strokeWidth={2}
                />
                <Path
                  d="M9.71317 14.5698C7.03064 14.5698 4.85603 12.3951 4.85603 9.71261C4.85603 7.03009 7.03064 4.85547 9.71317 4.85547C12.3957 4.85547 14.5703 7.03009 14.5703 9.71261C14.5703 12.3951 12.3957 14.5698 9.71317 14.5698Z"
                  stroke={color}
                  strokeWidth={2}
                />
                <Rect
                  x={19}
                  y={5}
                  width={11}
                  height={9}
                  rx={2}
                  stroke={color}
                  strokeWidth={2}
                  fill="none"
                />
              </Svg>
            ),
          }}
        />
        <Tabs.Screen
          name="comments"
          options={{
            title: "کامنت ها",
            tabBarIcon: ({ color, size }) => (
              <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
                <Path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2 14.6548C2 8.33317 7.05205 2.63672 14.0241 2.63672C20.8402 2.63672 26.0002 8.22517 26.0002 14.6188C26.0002 22.0349 19.9522 26.637 14.0001 26.637C12.0321 26.637 9.84808 26.109 8.09606 25.0745C7.48405 24.7025 6.96805 24.4265 6.30804 24.6425L3.88402 25.3625C3.27201 25.5545 2.72001 25.0745 2.90001 24.4265L3.70402 21.7337C3.83602 21.3617 3.81202 20.9645 3.62002 20.6513C2.58801 18.7529 2 16.6733 2 14.6548Z"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d="M13.9782 16.2098C13.1262 16.1978 12.4422 15.5126 12.4422 14.6594C12.4422 13.8182 13.1382 13.121 13.9782 13.133C14.3757 13.1487 14.7517 13.3176 15.0274 13.6044C15.3031 13.8912 15.4571 14.2736 15.4571 14.6714C15.4571 15.0692 15.3031 15.4516 15.0274 15.7383C14.7517 16.0251 14.3757 16.1941 13.9782 16.2098Z"
                  fill={color}
                />
                <Path
                  d="M19.5103 16.2098C18.6583 16.2098 17.9743 15.5126 17.9743 14.6714C17.9743 13.8182 18.6583 13.133 19.5103 13.133C19.9078 13.1487 20.2838 13.3176 20.5595 13.6044C20.8351 13.8912 20.9891 14.2736 20.9891 14.6714C20.9891 15.0692 20.8351 15.4516 20.5595 15.7383C20.2838 16.0251 19.9078 16.1941 19.5103 16.2098Z"
                  fill={color}
                />
                <Path
                  d="M6.91016 14.6714C6.91016 15.5138 7.60616 16.2098 8.44617 16.2098C8.85299 16.2066 9.24222 16.0435 9.52967 15.7556C9.81711 15.4677 9.97967 15.0782 9.98219 14.6714C9.98219 13.8182 9.29818 13.133 8.44617 13.133C7.59416 13.133 6.91016 13.8182 6.91016 14.6714Z"
                  fill={color}
                />
              </Svg>
            ),
          }}
        />
        <Tabs.Screen
          name="sales"
          options={{
            title: "مالی",
            tabBarIcon: ({ color, size }) => (
              <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
                <Path
                  d="M26 10.4173C26 8.61464 25.0296 6.95153 23.4603 6.06451L16.9603 2.3906C15.4336 1.52768 13.5664 1.52768 12.0397 2.3906L5.53972 6.06451C3.97037 6.95153 3 8.61465 3 10.4173V17.5827C3 19.3854 3.97037 21.0485 5.53971 21.9355L12.0397 25.6094C13.5664 26.4723 15.4336 26.4723 16.9603 25.6094L23.4603 21.9355C25.0296 21.0485 26 19.3854 26 17.5827V10.4173Z"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Path
                  d="M14.2049 12.7616V17.7146M19.2849 10.2852V17.7146M9.125 15.2381V17.7146"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            ),
            tabBarButton: (props) => (
              <Pressable
                style={props.style}
                onPress={openFinanceSheet}
                accessibilityRole="button"
                accessibilityLabel="باز کردن منوی مالی"
              >
                {props.children}
              </Pressable>
            ),
          }}
        />
        {/* صفحه اطلاعیه‌ها با هدر مشترک؛ در تب‌بار دیده نمی‌شود (فقط push از Header) */}
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="my-games"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="cancel-history"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {isFinanceSheetOpen ? (
        <>
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
            onPress={closeFinanceSheet}
          >
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: "rgba(15, 23, 43, 0.35)",
                opacity: overlayOpacity,
              }}
            />
          </Pressable>

          <Animated.View
            style={{
              position: "absolute",
              right: 0,
              left: 0,
              bottom: 20,
              zIndex: 0,
              transform: [{ translateY: sheetTranslateY }],
              paddingBottom: insets.bottom + 18,
              paddingHorizontal: 20,
              paddingTop: 14,
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 8,
              height: 230,
            }}
          >
            <View className="w-12 h-1 rounded-full bg-[#E2E8F0] self-center mb-4" />

            <View className="flex flex-row justify-between gap-3">
              {financeItems.map((item) => (
                <Pressable
                  key={item.key}
                  className="flex items-center justify-between gap-2  bg-[#F1F5F9] rounded-lg px-4 py-3"
                  onPress={() => selectFinanceSection(item.key)}
                  accessibilityRole="button"
                >
                  <Ionicons name={item.icon} size={20} color="#90A1B9" />
                  <Text className="text-base font-bold text-[#0F172B]">
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}
