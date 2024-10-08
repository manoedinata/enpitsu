import { Pressable, Text, TextInput, View } from "react-native";
import { router, Stack } from "expo-router";
import { validateId } from "@enpitsu/token-generator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "~/lib/api";
import { studentTokenAtom } from "~/lib/atom";

const formSchema = z.object({
  token: z
    .string()
    .min(1, {
      message: "Token wajib di isi!",
    })
    .min(13, { message: "Panjang nomor peserta wajib 13 karakter!" })
    .max(13, { message: "Panjang nomor peserta tidak boleh dari 13 karakter!" })
    .refine(validateId, { message: "Format token tidak sesuai!" }),
});

export const FirstTimeNoToken = () => {
  const [userToken, setToken] = useAtom(studentTokenAtom);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: userToken.token,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    setToken({ ...values });

  return (
    <View className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-5">
      <Text className="font-[SpaceMono] text-4xl text-gray-700 dark:text-gray-300">
        enpitsu
      </Text>

      <View className="sm:w-[90%] md:w-[50%]">
        <View className="flex flex-col gap-5">
          <View>
            <Text className="scroll-m-20 text-xl font-semibold tracking-tight dark:text-gray-50">
              Masukan Token
            </Text>

            <Text className="mt-1 text-justify leading-6 dark:text-gray-50">
              Masukan token yang tertera pada kartu ujian pada kolom input
              dibawah ini. Proses ini hanya di awal saja, namun bisa diganti
              kapan saja di halaman pengaturan.
            </Text>
          </View>

          <View className="flex flex-col gap-4">
            <View>
              <Text className="font-semibold dark:text-gray-50">Token</Text>

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    className="font-space mt-2 rounded border border-transparent bg-stone-50 p-2 pl-5 font-[IBMPlex] placeholder:pl-5 dark:border-stone-700 dark:bg-transparent dark:text-gray-50 dark:placeholder:text-gray-500"
                    placeholder="Masukan Token"
                    onBlur={onBlur}
                    onChangeText={(text) =>
                      text.trim().length <= 6 &&
                      onChange(text.toUpperCase().trim())
                    }
                    value={value}
                  />
                )}
                name="token"
              />

              {errors.token ? (
                <Text className="mt-2 text-red-500 dark:text-red-400">
                  {errors.token.message}
                </Text>
              ) : null}

              <Text className="mt-2 text-gray-500 dark:text-gray-400">
                Token yang tertera pada kartu ujian.
              </Text>
            </View>

            <Pressable
              className="rounded-lg bg-stone-900 p-4 dark:bg-stone-100"
              onPress={handleSubmit(onSubmit)}
            >
              <Text className="text-center text-slate-50 dark:text-stone-900">
                Simpan
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export const Settings = () => {
  const [userToken, setToken] = useAtom(studentTokenAtom);

  const apiUtils = api.useUtils();

  const { colorScheme } = useColorScheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: userToken.token,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await setToken({ ...values });

    void apiUtils.exam.getStudent.invalidate();

    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-5">
      <Stack.Screen options={{ headerShown: true, title: "Pengaturan" }} />
      <Text className="font-[SpaceMono] text-4xl text-gray-700 dark:text-gray-300">
        enpitsu
      </Text>

      <View className="sm:w-[90%] md:w-[50%]">
        <View className="flex flex-col gap-5">
          <View>
            <Text className="scroll-m-20 text-xl font-semibold tracking-tight dark:text-gray-50">
              Pengaturan
            </Text>

            <Text className="mt-1 text-justify leading-6 dark:text-gray-50">
              Atur token dan mode aplikasi ulangan pada halaman ini. Tap tombol
              kembali jika dianggap semua pengaturan aman.
            </Text>
          </View>

          <View className="flex flex-col gap-4">
            <View>
              <Text className="font-semibold dark:text-gray-50">Token</Text>

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    className="font-space mt-2 rounded border border-transparent bg-stone-50 p-2 pl-5 font-[IBMPlex] placeholder:pl-5 dark:border-stone-700 dark:bg-transparent dark:text-gray-50 dark:placeholder:text-gray-500"
                    placeholder="Masukan Token"
                    onBlur={onBlur}
                    onChangeText={(text) =>
                      text.trim().length <= 6 &&
                      onChange(text.toUpperCase().trim())
                    }
                    value={value}
                  />
                )}
                name="token"
              />

              {errors.token ? (
                <Text className="mt-2 text-red-500 dark:text-red-400">
                  {errors.token.message}
                </Text>
              ) : null}

              <Text className="mt-2 text-gray-500 dark:text-gray-400">
                Token yang tertera pada kartu ujian.
              </Text>
            </View>

            <Pressable
              className="rounded-lg bg-stone-900 p-4 dark:bg-stone-100"
              onPress={handleSubmit(onSubmit)}
            >
              <Text className="text-center text-slate-50 dark:text-stone-900">
                Simpan
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-10 flex items-center">
          <Pressable
            className="flex h-16 w-16 items-center justify-center rounded border border-stone-900/20 dark:border-stone-700"
            onPress={() => router.back()}
          >
            <ArrowLeft
              color={colorScheme === "dark" ? "#EAEAEA" : "#1C1917"}
              size={26}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
