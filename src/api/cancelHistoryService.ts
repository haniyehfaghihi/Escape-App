export type OwnerCancelHistoryStatus =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'overdue';

export type OwnerCancelHistoryFilter = 'all' | OwnerCancelHistoryStatus;

export type OwnerCancelHistoryRequestTiming = 'above_12' | 'below_12';

export type OwnerCancelHistoryRequestSource = 'player' | 'owner';

export type OwnerCancelHistoryItemDto = {
  id: string;
  status: OwnerCancelHistoryStatus;
  requestTiming: OwnerCancelHistoryRequestTiming;
  requestSource: OwnerCancelHistoryRequestSource;
  requestDate: string;
  reserveCode: string;
  gameDate: string;
  playerName: string;
  gameName: string;
};

const MOCK_CANCEL_HISTORY: OwnerCancelHistoryItemDto[] = [
  {
    id: '1',
    status: 'approved',
    requestTiming: 'above_12',
    requestSource: 'player',
    requestDate: '1403.06.28',
    reserveCode: '1234567',
    gameDate: '1403.06.28 22:45',
    playerName: 'سیدمحموداسکیپ مستر',
    gameName: 'ایستگاه شهر یخ',
  },
  {
    id: '2',
    status: 'approved',
    requestTiming: 'below_12',
    requestSource: 'owner',
    requestDate: '1403.06.28',
    reserveCode: '1234567',
    gameDate: '1403.06.28 22:45',
    playerName: 'سیدمحموداسکیپ مستر',
    gameName: 'ایستگاه شهر یخ',
  },
  {
    id: '3',
    status: 'pending',
    requestTiming: 'above_12',
    requestSource: 'player',
    requestDate: '1403.06.27',
    reserveCode: '9081726',
    gameDate: '1403.06.29 19:00',
    playerName: 'امیر حسینی',
    gameName: 'آزمایشگاه مرموز',
  },
  {
    id: '4',
    status: 'rejected',
    requestTiming: 'below_12',
    requestSource: 'player',
    requestDate: '1403.06.26',
    reserveCode: '7654321',
    gameDate: '1403.06.27 20:15',
    playerName: 'سارا محمدی',
    gameName: 'شب های تهران',
  },
  {
    id: '5',
    status: 'overdue',
    requestTiming: 'below_12',
    requestSource: 'owner',
    requestDate: '1403.06.25',
    reserveCode: '5544332',
    gameDate: '1403.06.26 17:40',
    playerName: 'علیرضا فراری زاده',
    gameName: 'موزه وارانسی(بازگشت)',
  },
];

export async function fetchOwnerCancelHistory(
  accessToken?: string | null,
  filter: OwnerCancelHistoryFilter = 'all',
): Promise<OwnerCancelHistoryItemDto[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      void accessToken;

      // TODO: جایگزین با API واقعی، مثال:
      // const base = process.env.EXPO_PUBLIC_API_URL;
      // if (!base) throw new Error('آدرس API تنظیم نشده');
      // const query = filter === 'all' ? '' : `?status=${filter}`;
      // const res = await fetch(`${base}/owner/cancel-history${query}`, {
      //   headers: {
      //     Accept: 'application/json',
      //     ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      //   },
      // });
      // if (!res.ok) throw new Error(await res.text() || res.statusText);
      // const data = (await res.json()) as OwnerCancelHistoryItemDto[];
      // return Array.isArray(data) ? data : [];

      const items =
        filter === 'all'
          ? MOCK_CANCEL_HISTORY
          : MOCK_CANCEL_HISTORY.filter((item) => item.status === filter);

      resolve([...items]);
    }, 500);
  });
}
