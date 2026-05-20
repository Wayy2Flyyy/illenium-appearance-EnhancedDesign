import type { IconType } from 'react-icons';
import { IoBodyOutline, IoFootstepsOutline, IoHappyOutline, IoPersonOutline } from 'react-icons/io5';

import type { CameraPreset } from './interfaces';

/** Order: feet → legs → default → head (matches game `constants.CAMERAS` keys). */
export const CAMERA_PRESETS: ReadonlyArray<{
  id: CameraPreset;
  title: string;
  Icon: IconType;
}> = [
  { id: 'feet', title: 'Feet', Icon: IoFootstepsOutline },
  { id: 'legs', title: 'Legs', Icon: IoBodyOutline },
  { id: 'default', title: 'Default', Icon: IoPersonOutline },
  { id: 'head', title: 'Head', Icon: IoHappyOutline },
];
