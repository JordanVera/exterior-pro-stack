import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { queryClient } from '@/lib/query';
import { colors } from '@/lib/theme';
import { EmptyState } from '@/components/Screen';
import {
  applyLiveJobMessage,
  useJobMessageLive,
} from '@/lib/job-message-stream';

type JobMessage = {
  id: string;
  body: string;
  createdAt: string | Date;
  mine: boolean;
  sender: { id: string; role: string | null; name: string };
};

function formatMessageTime(value: string | Date) {
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function MessageBubble({ message }: { message: JobMessage }) {
  return (
    <View
      className={`mb-3 max-w-[82%] ${message.mine ? 'self-end' : 'self-start'}`}
    >
      {!message.mine ? (
        <Text className="px-1 mb-1 text-xs font-semibold text-slate-400">
          {message.sender.name}
        </Text>
      ) : null}
      <View
        className={`rounded-2xl px-3.5 py-2.5 ${
          message.mine
            ? 'rounded-br-md bg-brand-lime'
            : 'rounded-bl-md bg-surface-raised'
        }`}
      >
        <Text
          className={`text-[15px] leading-5 ${
            message.mine ? 'text-brand-ink' : 'text-white'
          }`}
        >
          {message.body}
        </Text>
      </View>
      <Text className="mt-1 px-1 text-[11px] text-slate-500">
        {formatMessageTime(message.createdAt)}
      </Text>
    </View>
  );
}

export function JobMessageThread({ jobId }: { jobId: string }) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<JobMessage>>(null);

  const listQuery = useQuery({
    queryKey: ['job-messages', jobId],
    queryFn: () => trpc.message.list.query({ jobId }),
    enabled: Boolean(jobId),
  });

  useJobMessageLive(jobId, Boolean(jobId), (message) => {
    applyLiveJobMessage(jobId, message);
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => trpc.message.send.mutate({ jobId, body }),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: ['job-messages', jobId] });
      void queryClient.invalidateQueries({
        queryKey: ['job-message-unread', jobId],
      });
    },
  });

  const messages = listQuery.data?.messages ?? [];
  const canSend = listQuery.data?.canSend ?? false;

  useEffect(() => {
    if (!jobId) return;
    void trpc.message.markRead
      .mutate({ jobId })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: ['job-message-unread', jobId],
        }),
      )
      .catch(() => undefined);
  }, [jobId]);

  useEffect(() => {
    if (messages.length === 0) return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || sendMutation.isPending || !canSend) return;
    sendMutation.mutate(body);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {listQuery.isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={colors.lime} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          className="flex-1 px-5"
          contentContainerClassName="flex-grow justify-end py-4"
          ListEmptyComponent={
            <View className="flex-1 justify-center py-10">
              <EmptyState
                icon="chatbubble-ellipses-outline"
                title="No messages yet"
                body="Ask about access, timing, or anything the crew should know."
              />
            </View>
          }
        />
      )}

      <View className="flex-row gap-2 items-end px-5 py-3 border-t border-line bg-brand-night">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={
            canSend ? 'Write a message…' : 'Messaging is closed for this job'
          }
          placeholderTextColor="#64748b"
          multiline
          editable={canSend && !sendMutation.isPending}
          className="max-h-28 min-h-[48px] flex-1 rounded-2xl border border-line bg-surface-sunken px-4 py-3 font-sans text-base text-white"
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend || sendMutation.isPending || !draft.trim()}
          className={`h-12 w-12 items-center justify-center rounded-full ${
            !canSend || !draft.trim() ? 'bg-surface-raised' : 'bg-brand-lime'
          }`}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color={colors.ink} size="small" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={!canSend || !draft.trim() ? colors.muted : colors.ink}
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
