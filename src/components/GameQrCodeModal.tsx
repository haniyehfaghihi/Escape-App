import { Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOwnerGameQrValue, type OwnerGameDto } from '@/src/api/myGamesService';
import { CloseIcon } from '@/src/components/icons/close';

type GameQrCodeModalProps = {
  visible: boolean;
  game: OwnerGameDto | null;
  onClose: () => void;
};

export default function GameQrCodeModal({
  visible,
  game,
  onClose,
}: GameQrCodeModalProps) {
  if (!game) return null;

  return (
    <Modal
      transparent
      visible={visible} 
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center bg-black/45 px-5">
          <Pressable
            className="absolute inset-0"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="بستن"
          />

          <View
            className="w-full items-center gap-5 rounded-3xl bg-white p-6"
            style={{ maxWidth: 420 }}
          >
            <View className="w-full flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-[#0F172B]">
                QR کد بازی
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

            <Text className="text-center text-sm font-bold text-[#62748E]">
              {game.title}
            </Text>

            <View className="rounded-2xl border border-[#E4EBF0] bg-white p-4">
              <QRCode value={getOwnerGameQrValue(game.id)} size={220} />
            </View>

            <Text className="text-center text-xs font-bold text-[#889BAD]">
              این QR کد را برای ورود یا معرفی بازی اسکن کنید.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
