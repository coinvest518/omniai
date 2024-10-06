import * as React from 'react';

import { AppChat } from '../src/apps/chat/AppChat';

import { withLayout } from '~/common/layout/withLayout';


export default function ChatPage() {
  return withLayout({ type: 'optima' }, <AppChat />);
}