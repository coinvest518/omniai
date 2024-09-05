/* eslint-disable @next/next/no-img-element */
import * as React from 'react';

import { SvgIcon, SvgIconProps } from '@mui/joy';

import { Brand } from '~/common/app.config';
// Removed unused import
// import { capitalizeFirstLetter } from '~/common/util/textUtils';

export function AgiSquircleIcon(props: { inverted?: boolean, altColor?: string } & SvgIconProps) {
  console.log('Rendering AgiSquircleIcon with props:', props); // Add console log
  const { inverted, altColor, ...rest } = props;
  return (
    <SvgIcon
      titleAccess={`${Brand.Title.Base} logo mark`}
      viewBox='0 0 64 64' width='64' height='64'
      stroke='none' strokeWidth={0.691986} strokeLinecap='round' strokeLinejoin='round'
      {...rest}
    >
      <foreignObject width='64' height='64'>
        <img
          src='/images/icon-1024x1024.png'
          width='64'
          height='64'
          alt={`${Brand.Title.Base} logo mark`}
        />
      </foreignObject>
    </SvgIcon>
  );
}