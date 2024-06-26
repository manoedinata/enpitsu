import { useCallback, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import slugify from "slugify";
import type { z } from "zod";

import { api } from "~/lib/api";
import { Precaution } from "./Precaution";
import { ScannerWrapper } from "./Scanner";
import { formSchema } from "./schema";

export const ScanOrInputQuestionSlug = ({
  backToFrontPage,
}: {
  backToFrontPage: () => void;
}) => {
  const [isPrecautionOpen, setOpen] = useState(false);

  const getQuestionMutation = api.exam.getQuestion.useMutation({
    onSuccess() {
      setOpen(true);
    },
    onError(error) {
      Alert.alert(
        "Gagal mengambil data soal",
        error.message === "Failed to fetch"
          ? "Gagal meraih server"
          : error.message,
      );
    },
  });

  const closePrecaution = useCallback(() => setOpen(false), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const sendMutate = useCallback(
    (slug: string) => {
      form.setValue("slug", slug);

      getQuestionMutation.mutate({ slug });
    },
    [form, getQuestionMutation],
  );

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

  return (
    <View className="flex h-screen w-screen -translate-y-16 flex-col items-center justify-center gap-5 p-5">
      <Text className="font-[SpaceMono] text-4xl text-gray-700 dark:text-gray-300">
        enpitsu
      </Text>

      <View className="w-[85%] md:w-[55%] lg:w-[50%]">
        <Controller
          control={form.control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex">
              <View>
                <Text className="font-semibold dark:text-gray-50">
                  Kode Soal
                </Text>
                <TextInput
                  placeholder="Masukan Kode Soal"
                  onBlur={onBlur}
                  className="font-space mt-2 rounded border border-transparent bg-stone-50 p-2 pl-5 font-[IBMPlex] placeholder:pl-5 dark:border-stone-700 dark:bg-transparent dark:text-gray-50 dark:placeholder:text-gray-500"
                  onChangeText={(text) =>
                    onChange(
                      slugify(text, {
                        trim: false,
                        strict: true,
                        remove: /[*+~.()'"!:@]/g,
                      }).toUpperCase(),
                    )
                  }
                  value={value}
                />
                {form.formState.errors.slug ? (
                  <Text className="mb-1.5 mt-0.5 text-sm text-red-600 dark:text-red-500">
                    {form.formState.errors.slug.message}
                  </Text>
                ) : null}
              </View>

              <Pressable
                className="mt-2 flex h-10 items-center justify-center rounded-lg bg-stone-900 dark:bg-stone-100"
                disabled={getQuestionMutation.isLoading}
                onPress={form.handleSubmit(onSubmit)}
              >
                <Text
                  className={`text-center ${
                    getQuestionMutation.isLoading
                      ? "text-slate-50/75 dark:text-stone-900/75"
                      : "text-slate-50 dark:text-stone-900"
                  }`}
                >
                  Kerjakan
                </Text>
              </Pressable>
            </View>
          )}
          name="slug"
        />

        <View className="mt-8 flex w-full flex-col justify-center">
          <Text className="mb-2 text-center text-stone-900/75 dark:text-stone-50/75">
            atau
          </Text>

          <ScannerWrapper
            sendMutate={sendMutate}
            isDisabled={getQuestionMutation.isLoading}
          />
        </View>
      </View>

      <Pressable
        className="mt-6 flex h-[45] w-24 items-center justify-center rounded-lg border border-none bg-stone-900 text-stone-900 dark:border-stone-700 dark:bg-transparent disabled:dark:bg-stone-400"
        onPress={backToFrontPage}
        disabled={getQuestionMutation.isLoading}
      >
        <ArrowLeft
          color={getQuestionMutation.isLoading ? "#CACACA" : "#EAEAEA"}
          size={30}
        />
      </Pressable>

      <Precaution
        open={isPrecautionOpen}
        close={closePrecaution}
        data={getQuestionMutation.data}
      />
    </View>
  );
};
