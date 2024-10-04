import * as React from 'react';

import type { SxProps } from '@mui/joy/styles/types';
import { Box, Button, ButtonGroup, FormControl, Typography } from '@mui/joy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';

import { FormLabelStart } from '~/common/components/forms/FormLabelStart';
import { animationColorBeamScatter } from '~/common/util/animUtils';
import { useUserStore } from '~/common/state/userStore'; // Import user store

import type { BeamStoreApi } from '../store-beam.hooks';
import { BEAM_BTN_SX, SCATTER_COLOR, SCATTER_RAY_PRESETS } from '../beam.config';
import { BeamScatterDropdown } from './BeamScatterPaneDropdown';
import { beamPaneSx } from '../BeamCard';

const scatterPaneSx: SxProps = {
  ...beamPaneSx,
  backgroundColor: 'background.popup',

  // [desktop] scatter: primary-chan shadow
  // boxShadow: '0px 6px 12px -8px rgb(var(--joy-palette-primary-darkChannel) / 35%)',
  // boxShadow: '0px 16px 16px -24px rgb(var(--joy-palette-primary-darkChannel) / 35%)',
  boxShadow: '0px 6px 16px -12px rgb(var(--joy-palette-primary-darkChannel) / 50%)',
  // boxShadow: '0px 8px 20px -16px rgb(var(--joy-palette-primary-darkChannel) / 30%)',
};

const mobileScatterPaneSx: SxProps = scatterPaneSx;

const desktopScatterPaneSx: SxProps = {
  ...scatterPaneSx,

  // the fact that this works, means we got the CSS and layout right
  position: 'sticky',
  top: 0,
};

export function BeamScatterPane(props: {
  beamStore: BeamStoreApi
  isMobile: boolean,
  rayCount: number,
  setRayCount: (n: number) => void,
  startEnabled: boolean,
  startBusy: boolean,
  onStart: () => void,
  onStop: () => void,
  onExplainerShow: () => any,
}) {
  const { user, updateCredits, updateTokens } = useUserStore((state) => ({
    user: state.user,
    updateCredits: state.updateCredits,
    updateTokens: state.updateTokens,
  }));

  const handleStart = async () => {
    if (!user || user.credits < 50) {
      alert('Not enough credits to start.');
      return;
    }

    const newCredits = user.credits - 50; // Deduct 1 credit
    try {
      // Update user data on the server
      await fetch('/api/updateUserdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits: newCredits }),
      });
      updateCredits(newCredits); // Update local state
      props.onStart(); // Call the original start function
    } catch (error) {
      console.error('Error updating user credits:', error);
      alert('Failed to update credits. Please try again.');
    }
  };

  const handleStop = async () => {
    if (!user || user.tokens < 1) {
      alert('Not enough tokens to stop.');
      return;
    }

    const newTokens = user.tokens - 10000; // Deduct 1 token
    try {
      // Update user data on the server
      await fetch('/api/updateUserdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens: newTokens }),
      });
      updateTokens(newTokens); // Update local state
      props.onStop(); // Call the original stop function
    } catch (error) {
      console.error('Error updating user tokens:', error);
      alert('Failed to update tokens. Please try again.');
    }
  };

  const dropdownMemo = React.useMemo(() => (
    <BeamScatterDropdown
      beamStore={props.beamStore}
      onExplainerShow={props.onExplainerShow}
    />
  ), [props.beamStore, props.onExplainerShow]);

  return (
    <Box sx={props.isMobile ? mobileScatterPaneSx : desktopScatterPaneSx}>

      {/* Display user credits and tokens */}
      <Box sx={{ mb: 2 }}>
        <Typography level='body-sm'>
          Credits: {user?.credits || 0} | Tokens: {user?.tokens || 0}
        </Typography>
      </Box>

      {/* Title */}
      <Box>
        <Typography
          level='h4' component='h3'
          endDecorator={dropdownMemo}
          // sx={{ my: 0.25 }}
        >
          {props.startBusy
            ? <AutoAwesomeIcon sx={{ fontSize: '1rem', mr: 0.625, animation: `${animationColorBeamScatter} 2s linear infinite` }} />
            : <AutoAwesomeOutlinedIcon sx={{ fontSize: '1rem', mr: 0.625 }} />}Beam
        </Typography>
        <Typography level='body-sm' sx={{ whiteSpace: 'nowrap' }}>
          Explore different replies
          {/* Explore the solution space */}
        </Typography>
      </Box>

      {/* Ray presets */}
      <FormControl sx={{ my: '-0.25rem' }}>
        <FormLabelStart title='Beam Count' sx={/*{ mb: '0.25rem' }*/ undefined} />
        <ButtonGroup variant='outlined'>
          {SCATTER_RAY_PRESETS.map((n) => {
            const isActive = n === props.rayCount;
            return (
              <Button
                key={n}
                // variant={isActive ? 'solid' : undefined}
                color={isActive ? SCATTER_COLOR : 'neutral'}
                // color='neutral'
                size='sm'
                onClick={() => props.setRayCount(n)}
                sx={{
                  // backgroundColor: isActive ? 'background.popup' : undefined,
                  backgroundColor: isActive ? `${SCATTER_COLOR}.softBg` : 'background.popup',
                  fontWeight: isActive ? 'xl' : 400, /* reset, from 600 */
                  width: '3.125rem',
                }}
              >
                {`x${n}`}
              </Button>
            );
          })}
        </ButtonGroup>
      </FormControl>

      {/* Start / Stop buttons */}
      {!props.startBusy ? (
        <Button
          // key='scatter-start' // used for animation triggering, which we don't have now
          variant='solid' color={SCATTER_COLOR}
          disabled={!props.startEnabled || props.startBusy} loading={props.startBusy}
          endDecorator={<PlayArrowRoundedIcon />}
          onClick={handleStart}
          sx={BEAM_BTN_SX}
        >
          Start
        </Button>
      ) : (
        <Button
          // key='scatter-stop'
          variant='solid' color='danger'
          endDecorator={<StopRoundedIcon />}
          onClick={handleStop}
          sx={BEAM_BTN_SX}
        >
          Stop
          {/*{props.rayCount > props.raysReady && ` (${props.rayCount - props.raysReady})`}*/}
        </Button>
      )}

    </Box>
  );
}