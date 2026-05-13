import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRightIcon,
  LogoutIcon,
  MyGamesIcon,
  PanelArrowIcon,
  SupportTicketsIcon,
} from './icons';
import { ownerHasUnreadNotices } from '../../app/(owner)/notifications';

const PROFILE_PANEL_MAX_W = 374;
const PROFILE_PANEL_H_PAD = 16;

function NotificationIcon() {
  return (
    <Svg width={20} height={25} viewBox="0 0 20 25" fill="none">
      <Path
        d="M11.9809 21.4609H7.78906C7.78906 22.0168 8.00988 22.5499 8.40294 22.943C8.796 23.336 9.3291 23.5568 9.88496 23.5568C10.4408 23.5568 10.9739 23.336 11.367 22.943C11.76 22.5499 11.9809 22.0168 11.9809 21.4609Z"
        fill="#0F172B"
        stroke="#0F172B"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.0767 16.4671C18.5179 16.9091 18.7656 17.5081 18.7653 18.1326C18.7653 18.4417 18.7044 18.7478 18.5861 19.0335C18.4678 19.3191 18.2944 19.5786 18.0758 19.7972C17.8572 20.0157 17.5977 20.1891 17.3121 20.3074C17.0265 20.4257 16.7204 20.4866 16.4112 20.4866H3.35403C3.04487 20.4867 2.73873 20.4259 2.4531 20.3076C2.16746 20.1893 1.90793 20.0159 1.68932 19.7973C1.47072 19.5787 1.29732 19.3192 1.17905 19.0335C1.06077 18.7479 0.99993 18.4418 1 18.1326C0.999693 17.5081 1.24736 16.9091 1.68857 16.4671L3.22079 14.9349V10.4939C3.22079 8.72704 3.92266 7.03258 5.172 5.78324C6.42134 4.5339 8.1158 3.83203 9.88263 3.83203C11.6495 3.83203 13.3439 4.5339 14.5933 5.78324C15.8426 7.03258 16.5445 8.72704 16.5445 10.4939V14.9349L18.0767 16.4671Z"
        fill="none"
        stroke="#0F172B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.78476 2.59766L11.9766 2.59766C11.9766 2.04179 11.7557 1.50869 11.3627 1.11563C10.9696 0.722573 10.4365 0.501756 9.88066 0.501756C9.32479 0.501755 8.79169 0.722573 8.39864 1.11563C8.00558 1.50869 7.78476 2.04179 7.78476 2.59766Z"
        fill="#0F172B"
        stroke="#0F172B"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="M3.00391 22.2525C3.00391 20.7942 3.58323 19.3956 4.61442 18.3644C5.64562 17.3332 7.04422 16.7539 8.50255 16.7539H19.4998C20.9582 16.7539 22.3568 17.3332 23.3879 18.3644C24.4191 19.3956 24.9985 20.7942 24.9985 22.2525C24.9985 22.9817 24.7088 23.681 24.1932 24.1966C23.6776 24.7122 22.9783 25.0019 22.2491 25.0019H5.75323C5.02406 25.0019 4.32476 24.7122 3.80916 24.1966C3.29357 23.681 3.00391 22.9817 3.00391 22.2525Z"
        stroke="#0F172B"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M13.999 11.2519C16.2766 11.2519 18.123 9.4055 18.123 7.12789C18.123 4.85027 16.2766 3.00391 13.999 3.00391C11.7214 3.00391 9.875 4.85027 9.875 7.12789C9.875 9.4055 11.7214 11.2519 13.999 11.2519Z"
        stroke="#0F172B"
        strokeWidth={2}
      />
    </Svg>
  );
}

function buildNotificationsReturnParams(
  pathname: string,
  globalParams: ReturnType<typeof useGlobalSearchParams>,
): { returnPath: string; returnParams?: string } {
  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(globalParams)) {
    if (key === "returnPath" || key === "returnParams") continue;
    if (typeof value === "string") extra[key] = value;
    else if (Array.isArray(value) && value[0] != null) extra[key] = String(value[0]);
  }
  const returnParams =
    Object.keys(extra).length > 0 ? JSON.stringify(extra) : undefined;
  return { returnPath: pathname, returnParams };
}

export default function Header() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const globalParams = useGlobalSearchParams();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const refreshUnreadNotifications = useCallback(async () => {
    try {
      setHasUnreadNotifications(await ownerHasUnreadNotices());
    } catch {
      setHasUnreadNotifications(false);
    }
  }, []);

  useEffect(() => {
    void refreshUnreadNotifications();
  }, [refreshUnreadNotifications]);

  useFocusEffect(
    useCallback(() => {
      void refreshUnreadNotifications();
    }, [refreshUnreadNotifications]),
  );

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void refreshUnreadNotifications();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [refreshUnreadNotifications]);
  const screenW = Dimensions.get('window').width;
  const screenH = Dimensions.get('window').height;
  const profilePanelWidth = Math.min(
    PROFILE_PANEL_MAX_W,
    screenW - PROFILE_PANEL_H_PAD * 2
  );
  const headerAreaHeight = insets.top + 64;
  return (
    <View className="relative z-50">
      <View
        className="bg-white dark:bg-gray-900 border-b border-[#e5e5e5] dark:border-gray-800 px-4 pb-3 flex-row justify-between items-center"
        style={{ paddingTop: insets.top + 10 }} // برای رعایت فضای امن ناچ گوشی
      >

      {/* سمت راست: رفتن به صفحه اطلاعیه‌ها */}
      <TouchableOpacity
        onPress={() => {
          if (pathname.includes("notifications")) return;
          const ret = buildNotificationsReturnParams(pathname, globalParams);
          router.push({
            pathname: "/(owner)/notifications",
            params: {
              returnPath: ret.returnPath,
              ...(ret.returnParams ? { returnParams: ret.returnParams } : {}),
            },
          });
        }}
        accessibilityRole="button"
        accessibilityLabel={
          hasUnreadNotifications
            ? 'مشاهده اطلاعیه‌ها، اطلاعیه خوانده‌نشده دارید'
            : 'مشاهده اطلاعیه‌ها'
        }
      >
        <View className="relative" style={{ width: 20, height: 25 }}>
          <NotificationIcon />
          {hasUnreadNotifications ? (
            <View
              pointerEvents="none"
              className="absolute rounded-full bg-[#FC6F13] border-2 border-white"
              style={{
                width: 9,
                height: 9,
                left: -2,
                bottom: -1,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>


      {/* وسط: لوگو */}
      <View>
        <BrandLogo width={126} height={42} />
      </View>


      {/* سمت چپ: پروفایل */}
      <View className="relative">
        <TouchableOpacity onPress={() => setShowProfileMenu((prev) => !prev)}>
          <ProfileIcon />
        </TouchableOpacity>
      </View>
      </View>

      {showProfileMenu ? (
        <>
          <Pressable
            onPress={() => setShowProfileMenu(false)}
            accessibilityRole="button"
            accessibilityLabel="بستن منوی پروفایل" 
            style={{
              position: 'absolute',
              top: headerAreaHeight,
              left: 0,
              width: screenW,
              height: Math.max(0, screenH - headerAreaHeight ),
              backgroundColor: 'rgba(15, 23, 43, 0.45)',
              zIndex: 40,
            }}
          />
          <View
            pointerEvents="box-none"
            className="absolute left-0 right-0 top-full items-center"
            style={{ zIndex: 50 }}
          >
            <View
              className="bg-white px-4 py-5 rounded-b-3xl border border-gray-100"
              style={{ width: profilePanelWidth }}
            >

                    <View className='flex flex-row items-center justify-between'>
                      <Text className='text-base font-bold'>سید حمید فراری زادگان</Text>
                      <Text className='text-base font-bold text-[#62748E]'>09124527788</Text>
                    </View>

                    {/* <View className='flex flex-row items-center justify-between rounded-lg px-3 py-2 bg-[#E2E8F0] mt-6'>
                      <Text className='text-base font-bold text-[#1447E6]'>رفتن به پنل کاربری</Text>
                      <PanelArrowIcon width={16} height={16} />
                    </View> */}

                    <View className='w-full h-[1px] bg-[#F1F5F9] my-6'></View>

                    <View className='gap-6'>
                      <Pressable
                        className='flex flex-row items-center justify-between'
                        onPress={() => {
                          setShowProfileMenu(false);
                          router.push('/(owner)/my-games');
                        }}
                        accessibilityRole='button'
                        accessibilityLabel='بازی‌های من'
                      >
                        <View className='flex flex-row items-center justify-center gap-2'>
                          <MyGamesIcon width={22} height={22} />
                          <Text className='text-base font-bold'>بازی‌های من</Text>
                        </View>
                        <ChevronRightIcon width={6} height={12} />
                      </Pressable>

                      <View className='flex flex-row items-center justify-between'>
                        <View className='flex flex-row items-center justify-center gap-2'>
                          <SupportTicketsIcon width={22} height={22} />
                          <Text className='text-base font-bold'>تیکت های پشتیبانی</Text>
                        </View>

                        <ChevronRightIcon width={6} height={12} />

                      </View>

                      <Pressable
                        className='flex flex-row items-center justify-between'
                        onPress={async () => {
                          setShowProfileMenu(false);
                          await signOut();
                        }}
                        accessibilityRole='button'
                        accessibilityLabel='خروج از حساب'
                      >
                        <View className='flex flex-row items-center justify-center gap-2'>
                          <LogoutIcon width={22} height={22} />
                          <Text className='text-base font-bold'>خروج</Text>
                        </View>
                        <ChevronRightIcon width={6} height={12} />
                      </Pressable>
                    </View>

            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}










