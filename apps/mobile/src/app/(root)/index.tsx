import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Link } from "expo-router";
import { Settings } from "lucide-react-native";

import { Logout } from "~/components/IndexRouter/Logout";
import { ScanOrInputQuestionSlug } from "~/components/IndexRouter/ScanOrInputQuestionSlug";
import { api } from "~/lib/api";

const duration = 1000;

const LoadingComponent = () => {
  const sv = useSharedValue(1);

  useEffect(() => {
    sv.value = withRepeat(
      withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
      -1,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
  }));

  return (
    <Animated.View
      style={style}
      className="h-6 w-full rounded rounded-lg bg-stone-300 dark:bg-stone-700"
    />
  );
};

const Error = () => (
  <View className="h-6 w-full rounded rounded-lg bg-rose-300 dark:bg-rose-700" />
);

const Separator = () => (
  <View className="h-1 w-[390px] border-t border-stone-300 dark:border-stone-700" />
);

export default function HomePage() {
  const [isCorrect, setCorrect] = useState(false);

  const backToFrontPage = useCallback(() => setCorrect(false), []);

  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      Alert.alert(
        "Gagal mengambil data pribadi",
        `Operasi mengambil data gagal, mohon coba lagi. Error: ${
          error.message === "Failed to fetch"
            ? "Gagal meraih server"
            : error.message
        }`,
      );
    },
  });

  if (!studentQuery.isError && isCorrect)
    return <ScanOrInputQuestionSlug backToFrontPage={backToFrontPage} />;

  return (
    <View className="flex h-screen items-center justify-center p-3">
      <View className="-translate-y-16 rounded-lg border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-transparent sm:w-[450px]">
        <View className="flex flex-col p-6">
          <Text className="text-2xl font-semibold leading-none dark:text-gray-50">
            Sebelum Mengerjakan,
          </Text>
          <Text className="mt-1.5 text-justify text-xl dark:text-gray-100">
            Pastikan identitas anda sudah benar dan sesuai dengan yang tertera
            pada kartu ujian.
          </Text>
        </View>

        <Separator />

        <View className="flex flex-col gap-2 p-6">
          {studentQuery.isError ? (
            <Error />
          ) : (
            <>
              {!studentQuery.isLoading && studentQuery.data?.student ? (
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Text className="dark:text-gray-50">No Peserta</Text>
                    <Text className="px-1 dark:text-gray-50">:</Text>
                  </View>
                  <Text className="dark:text-gray-50">
                    {studentQuery.data.student.participantNumber}
                  </Text>
                </View>
              ) : (
                <LoadingComponent />
              )}
            </>
          )}

          {studentQuery.isError ? (
            <Error />
          ) : (
            <>
              {!studentQuery.isLoading && studentQuery.data?.student ? (
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Text className="dark:text-gray-50">Nama</Text>
                    <Text className="px-1 dark:text-gray-50">:</Text>
                  </View>
                  <Text className="dark:text-gray-50">
                    {studentQuery.data.student.name}
                  </Text>
                </View>
              ) : (
                <LoadingComponent />
              )}
            </>
          )}

          {studentQuery.isError ? (
            <Error />
          ) : (
            <>
              {!studentQuery.isLoading && studentQuery.data?.student ? (
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Text className="dark:text-gray-50">Kelas</Text>
                    <Text className="px-1 dark:text-gray-50">:</Text>
                  </View>
                  <Text className="dark:text-gray-50">
                    {studentQuery.data.student.subgrade.grade.label}{" "}
                    {studentQuery.data.student.subgrade.label}
                  </Text>
                </View>
              ) : (
                <LoadingComponent />
              )}
            </>
          )}

          {studentQuery.isError ? (
            <Error />
          ) : (
            <>
              {!studentQuery.isLoading && studentQuery.data?.student ? (
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Text className="dark:text-gray-50">Ruangan</Text>
                    <Text className="px-1 dark:text-gray-50">:</Text>
                  </View>
                  <Text className="dark:text-gray-50">
                    {studentQuery.data.student.room}
                  </Text>
                </View>
              ) : (
                <LoadingComponent />
              )}
            </>
          )}

          {studentQuery.isError ? (
            <Error />
          ) : (
            <>
              {!studentQuery.isLoading && studentQuery.data?.student ? (
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center">
                    <Text className="dark:text-gray-50">Token</Text>
                    <Text className="px-1 dark:text-gray-50">:</Text>
                  </View>
                  <Text className="font-[IBMPlex] dark:text-gray-50">
                    {studentQuery.data.student.token}
                  </Text>
                </View>
              ) : (
                <LoadingComponent />
              )}
            </>
          )}
        </View>

        <Separator />

        <View className="flex flex-row gap-2 p-6">
          <Link href="/settings/" asChild>
            <Pressable className="flex w-[10%] items-center justify-center rounded-lg bg-transparent dark:bg-stone-200">
              <Settings color="#0c0a09" size={23} />
            </Pressable>
          </Link>

          <Pressable
            className="w-[75%] rounded-lg bg-stone-900 p-2 disabled:bg-stone-600 dark:bg-stone-100 disabled:dark:bg-stone-500"
            disabled={!studentQuery.data || studentQuery.isError}
            onPress={() => setCorrect(true)}
          >
            <Text className="text-center text-slate-50 dark:text-slate-800">
              Ya, sudah benar
            </Text>
          </Pressable>

          <Logout />
        </View>
      </View>
    </View>
  );
}
