import * as React from 'react';
import { useRouter } from 'next/router';

import { autoConfInitiateConfiguration } from '~/common/logic/autoconf';
import { ROUTE_APP_CHAT } from '~/common/app.routes';
import { useNextLoadProgress } from '~/common/components/useNextLoadProgress';

export function ProviderBootstrapLogic(props: { children: React.ReactNode }) {
  // external state
  const { route, events } = useRouter();

  // wire-up the NextJS router to a loading bar to be displayed while routes change
  useNextLoadProgress(route, events);

  // [bootup] logic
  const isOnChat = route === ROUTE_APP_CHAT;

  // [autoconf] initiate the llm auto-configuration process if on the chat
  const doAutoConf = isOnChat;
  React.useEffect(() => {
    doAutoConf && autoConfInitiateConfiguration();
  }, [doAutoConf]);

  return props.children;
}