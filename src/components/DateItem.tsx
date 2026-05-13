import React, { memo } from "react";
import { Pressable, Text } from "react-native";

export type DateItemData = {
  id: string;
  day: string;
  label: string;
};

type DateItemProps = {
  item: DateItemData;
  isSelected?: boolean;
  onPress?: (item: DateItemData) => void;
};

const DateItem = memo(function DateItem({
  item,
  isSelected = false,
  onPress,
}: DateItemProps) {
  return (
    <Pressable
      className={`w-[52px] h-[56px] border flex justify-center items-center rounded-[10px] p-2 ${
        isSelected ? "border-[#F75A13] bg-[#FC6F13]" : "border-[#E8EDF1] bg-white"
      }`}
      onPress={() => onPress?.(item)}
      style={{
        shadowColor: isSelected ? "#F75A13" : "#E8EDF1",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isSelected ? 0.35 : 1,
        shadowRadius: isSelected ? 1 : 0,
        elevation: 1,
      }}
    >
      <Text className={`text-xl font-extrabold ${isSelected ? "text-white" : "text-black"}`}>
        {item.day}
      </Text>
      <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-black"}`}>
        {item.label}
      </Text>
    </Pressable>
  );
});

export default DateItem;
