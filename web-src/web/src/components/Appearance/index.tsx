import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTransition as useTransitionAnimation, animated } from 'react-spring';
import { useNuiState } from '../../hooks/nuiState';
import Nui from '../../Nui';
import mock from '../../mock';

import {
  CustomizationConfig,
  PedAppearance,
  AppearanceSettings,
  PedHeadBlend,
  PedFaceFeatures,
  PedHeadOverlays,
  PedHeadOverlayValue,
  PedHair,
  CameraPreset,
  ClothesState,
  Tattoo,
  TattoosSettings,
} from './interfaces';

import {
  APPEARANCE_INITIAL_STATE,
  SETTINGS_INITIAL_STATE,
  ROTATE_INITIAL_STATE,
  CLOTHES_INITIAL_STATE,
} from './settings';

import Ped from './Ped';
import HeadBlend from './HeadBlend';
import FaceFeatures from './FaceFeatures';
import HeadOverlays from './HeadOverlays';
import Options from './Options';
import Modal from '../Modal';
import Tattoos from './Tattoos';
import ClothingHero from './ClothingHero';

import { Wrapper, Container, AppearanceBrandCredit } from './styles';

if (!import.meta.env.PROD) {
  mock('appearance_get_settings', () => ({
    appearanceSettings: {
      ...SETTINGS_INITIAL_STATE,
      eyeColor: { min: 0, max: 24 },
      hair: {
        ...SETTINGS_INITIAL_STATE.hair,
        color: {
          items: [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
            [0, 0, 255],
          ],
        },
      },
    },
  }));

  mock('appearance_get_data', () => ({
    appearanceData: { ...APPEARANCE_INITIAL_STATE, model: 'mp_f_freemode_01' },
  }));

  mock('appearance_change_model', () => SETTINGS_INITIAL_STATE);

  mock('appearance_change_component', () => SETTINGS_INITIAL_STATE.components);

  mock('appearance_change_prop', () => SETTINGS_INITIAL_STATE.props);
}

const Appearance = () => {
  const [config, setConfig] = useState<CustomizationConfig>();

  const [data, setData] = useState<PedAppearance>();
  const [storedData, setStoredData] = useState<PedAppearance>();
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>();

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');
  const [rotate, setRotate] = useState(ROTATE_INITIAL_STATE);
  const [clothes, setClothes] = useState(CLOTHES_INITIAL_STATE);

  const [saveModal, setSaveModal] = useState(false);
  const [exitModal, setExitModal] = useState(false);

  const { display, setDisplay, locales, setLocales } = useNuiState();

  const wrapperTransition = useTransitionAnimation(display.appearance, null, {
    from: { transform: 'translateX(-50px)', opacity: 0 },
    enter: { transform: 'translateY(0)', opacity: 1 },
    leave: { transform: 'translateX(-50px)', opacity: 0 },
  });

  const saveModalTransition = useTransitionAnimation(saveModal, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const exitModalTransition = useTransitionAnimation(exitModal, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const handleTurnAround = useCallback(() => {
    Nui.post('appearance_turn_around');
  }, []);

  const handleSetClothes = useCallback(
    (key: keyof ClothesState) => {
      setClothes({ ...clothes, [key]: !clothes[key] });
      if (!clothes[key]) {
        Nui.post('appearance_remove_clothes', key);
      } else {
        Nui.post('appearance_wear_clothes', { data, key });
      }
    },
    [data, clothes, setClothes],
  );

  const handleSetCameraPreset = useCallback(
    (preset: CameraPreset) => {
      setRotate(ROTATE_INITIAL_STATE);
      setCameraPreset(preset);
      Nui.post('appearance_set_camera', preset);
    },
    [setRotate],
  );

  const handleRotateLeft = useCallback(() => {
    setRotate({ left: !rotate.left, right: false });

    if (!rotate.left) {
      Nui.post('appearance_rotate_camera', 'left');
    } else {
      Nui.post('appearance_set_camera', 'current');
    }
  }, [setRotate, rotate]);

  const handleRotateRight = useCallback(() => {
    setRotate({ left: false, right: !rotate.right });

    if (!rotate.right) {
      Nui.post('appearance_rotate_camera', 'right');
    } else {
      Nui.post('appearance_set_camera', 'current');
    }
  }, [setRotate, rotate]);

  const handleSaveModal = useCallback(() => {
    setSaveModal(true);
  }, [setSaveModal]);

  const handleExitModal = useCallback(() => {
    setExitModal(true);
  }, [setExitModal]);

  const handleSave = useCallback(
    async (accept: boolean) => {
      if (accept) {
        await Nui.post('appearance_save', data);
        setSaveModal(false);
      } else {
        setSaveModal(false);
      }
    },
    [setSaveModal, data],
  );

  const handleExit = useCallback(
    async (accept: boolean) => {
      if (accept) {
        await Nui.post('appearance_exit');
        setExitModal(false);
      } else {
        setExitModal(false);
      }
    },
    [setExitModal],
  );

  const handleModelChange = useCallback(
    async (value: string) => {
      const { appearanceSettings: _appearanceSettings, appearanceData } = await Nui.post(
        'appearance_change_model',
        value,
      );

      setAppearanceSettings(_appearanceSettings);
      setData(appearanceData);
    },
    [setData, setAppearanceSettings],
  );

  const handleHeadBlendChange = useCallback(
    (key: keyof PedHeadBlend, value: number) => {
      if (!data) return;

      const updatedHeadBlend = { ...data.headBlend, [key]: value };

      const updatedData = { ...data, headBlend: updatedHeadBlend };

      setData(updatedData);

      Nui.post('appearance_change_head_blend', updatedHeadBlend);
    },
    [data, setData],
  );

  const handleFaceFeatureChange = useCallback(
    (key: keyof PedFaceFeatures, value: number) => {
      if (!data) return;

      const updatedFaceFeatures = { ...data.faceFeatures, [key]: value };

      const updatedData = { ...data, faceFeatures: updatedFaceFeatures };

      setData(updatedData);

      Nui.post('appearance_change_face_feature', updatedFaceFeatures);
    },
    [data, setData],
  );

  const handleHairChange = useCallback(
    async (key: keyof PedHair, value: number) => {
      if (!data || !appearanceSettings) return;

      const updatedHair = { ...data.hair, [key]: value };

      const updatedData = { ...data, hair: updatedHair };

      setData(updatedData);

      const updatedHairSettings = await Nui.post('appearance_change_hair', updatedHair);

      const updatedSettings = { ...appearanceSettings, hair: updatedHairSettings };

      setAppearanceSettings(updatedSettings);
    },
    [data, setData, appearanceSettings, setAppearanceSettings],
  );

  const handleChangeFade = useCallback(async (value: number) => {
    if (!data || !appearanceSettings) return;
      const { tattoos } = data;
      const updatedTattoos = { ...tattoos };
      const tattoo = appearanceSettings.tattoos.items['ZONE_HAIR'][value]
      if (!updatedTattoos[tattoo.zone]) updatedTattoos[tattoo.zone] = [];
      updatedTattoos[tattoo.zone] = [tattoo];
      await Nui.post('appearance_apply_tattoo', updatedTattoos);
      setData({ ...data, tattoos: updatedTattoos });
  }, [appearanceSettings, data, setData])

  const handleHeadOverlayChange = useCallback(
    (key: keyof PedHeadOverlays, option: keyof PedHeadOverlayValue, value: number) => {
      if (!data) return;

      const updatedValue = { ...data.headOverlays[key], [option]: value };

      const updatedData = { ...data, headOverlays: { ...data.headOverlays, [key]: updatedValue } };

      setData(updatedData);

      Nui.post('appearance_change_head_overlay', { ...data.headOverlays, [key]: updatedValue });
    },
    [data, setData],
  );

  const handleEyeColorChange = useCallback(
    (value: number) => {
      if (!data) return;

      const updatedData = { ...data, eyeColor: value };

      setData(updatedData);

      Nui.post('appearance_change_eye_color', value);
    },
    [data, setData],
  );

  const handleComponentDrawableChange = useCallback(
    async (component_id: number, drawable: number) => {
      if (!data || !appearanceSettings) return;

      const component = data.components.find(c => c.component_id === component_id);

      if (!component) return;

      const updatedComponent = { ...component, drawable, texture: 0 };

      const filteredComponents = data.components.filter(c => c.component_id !== component_id);

      const updatedComponents = [...filteredComponents, updatedComponent];

      const updatedData = { ...data, components: updatedComponents };

      setData(updatedData);

      const updatedComponentSettings = await Nui.post('appearance_change_component', updatedComponent);

      const filteredComponentsSettings = appearanceSettings.components.filter(c => c.component_id !== component_id);

      const updatedComponentsSettings = [...filteredComponentsSettings, updatedComponentSettings];

      const updatedSettings = { ...appearanceSettings, components: updatedComponentsSettings };

      setAppearanceSettings(updatedSettings);
    },
    [data, setData, appearanceSettings, setAppearanceSettings],
  );

  const handleComponentTextureChange = useCallback(
    async (component_id: number, texture: number) => {
      if (!data || !appearanceSettings) return;

      const component = data.components.find(c => c.component_id === component_id);

      if (!component) return;

      const updatedComponent = { ...component, texture };

      const filteredComponents = data.components.filter(c => c.component_id !== component_id);

      const updatedComponents = [...filteredComponents, updatedComponent];

      const updatedData = { ...data, components: updatedComponents };

      setData(updatedData);

      const updatedComponentSettings = await Nui.post('appearance_change_component', updatedComponent);

      const filteredComponentsSettings = appearanceSettings.components.filter(c => c.component_id !== component_id);

      const updatedComponentsSettings = [...filteredComponentsSettings, updatedComponentSettings];

      const updatedSettings = { ...appearanceSettings, components: updatedComponentsSettings };

      setAppearanceSettings(updatedSettings);
    },
    [data, setData, appearanceSettings, setAppearanceSettings],
  );

  const handlePropDrawableChange = useCallback(
    async (prop_id: number, drawable: number) => {
      if (!data || !appearanceSettings) return;

      const prop = data.props.find(p => p.prop_id === prop_id);

      if (!prop) return;

      const updatedProp = { ...prop, drawable, texture: 0 };

      const filteredProps = data.props.filter(p => p.prop_id !== prop_id);

      const updatedProps = [...filteredProps, updatedProp];

      const updatedData = { ...data, props: updatedProps };

      setData(updatedData);

      const updatedPropSettings = await Nui.post('appearance_change_prop', updatedProp);

      const filteredPropsSettings = appearanceSettings.props.filter(c => c.prop_id !== prop_id);

      const updatedPropsSettings = [...filteredPropsSettings, updatedPropSettings];

      const updatedSettings = { ...appearanceSettings, props: updatedPropsSettings };

      setAppearanceSettings(updatedSettings);
    },
    [data, setData, appearanceSettings, setAppearanceSettings],
  );

  const handlePropTextureChange = useCallback(
    async (prop_id: number, texture: number) => {
      if (!data || !appearanceSettings) return;

      const prop = data.props.find(p => p.prop_id === prop_id);

      if (!prop) return;

      const updatedProp = { ...prop, texture };

      const filteredProps = data.props.filter(p => p.prop_id !== prop_id);

      const updatedProps = [...filteredProps, updatedProp];

      const updatedData = { ...data, props: updatedProps };

      setData(updatedData);

      const updatedPropSettings = await Nui.post('appearance_change_prop', updatedProp);

      const filteredPropsSettings = appearanceSettings.props.filter(c => c.prop_id !== prop_id);

      const updatedPropsSettings = [...filteredPropsSettings, updatedPropSettings];

      const updatedSettings = { ...appearanceSettings, props: updatedPropsSettings };

      setAppearanceSettings(updatedSettings);
    },
    [data, setData, appearanceSettings, setAppearanceSettings],
  );

  /**
   * Apply a batch of component / prop / hair updates atomically.
   *
   * The individual handlers above read `data` from the closure, so calling them
   * in a tight loop (e.g. from the Random button) caused every update except
   * the last one to be dropped — the ped therefore ended up wearing only the
   * final random piece instead of a full outfit. This builds the next
   * `PedAppearance` once and pushes each piece to the game in sequence so the
   * UI and ped stay in sync.
   */
  const handleRandomize = useCallback(
    async (updates: {
      components?: { component_id: number; drawable: number }[];
      props?: { prop_id: number; drawable: number }[];
      hair?: { style: number };
    }) => {
      if (!data || !appearanceSettings) return;

      const componentUpdates = updates.components ?? [];
      const propUpdates = updates.props ?? [];
      const hairUpdate = updates.hair;

      const componentMap = new Map(componentUpdates.map(u => [u.component_id, u.drawable]));
      const propMap = new Map(propUpdates.map(u => [u.prop_id, u.drawable]));

      const nextComponents = data.components.map(component => {
        if (!componentMap.has(component.component_id)) return component;
        return { ...component, drawable: componentMap.get(component.component_id) as number, texture: 0 };
      });

      const nextProps = data.props.map(prop => {
        if (!propMap.has(prop.prop_id)) return prop;
        return { ...prop, drawable: propMap.get(prop.prop_id) as number, texture: 0 };
      });

      const nextHair = hairUpdate ? { ...data.hair, style: hairUpdate.style } : data.hair;

      setData({ ...data, components: nextComponents, props: nextProps, hair: nextHair });

      const changedComponents = nextComponents.filter(c => componentMap.has(c.component_id));
      const changedProps = nextProps.filter(p => propMap.has(p.prop_id));

      const componentSettingsUpdates = await Promise.all(
        changedComponents.map(component => Nui.post('appearance_change_component', component)),
      );
      const propSettingsUpdates = await Promise.all(
        changedProps.map(prop => Nui.post('appearance_change_prop', prop)),
      );

      let hairSettingsUpdate: any = undefined;
      if (hairUpdate) {
        hairSettingsUpdate = await Nui.post('appearance_change_hair', nextHair);
      }

      setAppearanceSettings(currentSettings => {
        if (!currentSettings) return currentSettings;

        const componentSettingsMap = new Map<number, any>(
          componentSettingsUpdates
            .filter(Boolean)
            .map(updated => [updated.component_id as number, updated]),
        );
        const propSettingsMap = new Map<number, any>(
          propSettingsUpdates.filter(Boolean).map(updated => [updated.prop_id as number, updated]),
        );

        return {
          ...currentSettings,
          components: currentSettings.components.map(c =>
            componentSettingsMap.has(c.component_id) ? componentSettingsMap.get(c.component_id) : c,
          ),
          props: currentSettings.props.map(p =>
            propSettingsMap.has(p.prop_id) ? propSettingsMap.get(p.prop_id) : p,
          ),
          hair: hairSettingsUpdate ?? currentSettings.hair,
        };
      });
    },
    [data, appearanceSettings, setData, setAppearanceSettings],
  );

  /**
   * Apply a full saved outfit (used by the bottom-bar slots). Same rationale
   * as `handleRandomize` — closure-stale state means we have to build the
   * complete next `PedAppearance` in one shot.
   */
  const handleApplyOutfit = useCallback(
    async (outfit: PedAppearance) => {
      if (!data || !appearanceSettings) return;

      const componentMap = new Map(outfit.components.map(c => [c.component_id, c]));
      const propMap = new Map(outfit.props.map(p => [p.prop_id, p]));

      const nextComponents = data.components.map(component => {
        const incoming = componentMap.get(component.component_id);
        if (!incoming) return component;
        return { ...component, drawable: incoming.drawable, texture: incoming.texture };
      });

      const nextProps = data.props.map(prop => {
        const incoming = propMap.get(prop.prop_id);
        if (!incoming) return prop;
        return { ...prop, drawable: incoming.drawable, texture: incoming.texture };
      });

      const nextHair = outfit.hair
        ? { ...data.hair, style: outfit.hair.style, texture: outfit.hair.texture }
        : data.hair;

      setData({ ...data, components: nextComponents, props: nextProps, hair: nextHair });

      const changedComponents = nextComponents.filter(c => componentMap.has(c.component_id));
      const changedProps = nextProps.filter(p => propMap.has(p.prop_id));

      await Promise.all([
        ...changedComponents.map(component => Nui.post('appearance_change_component', component)),
        ...changedProps.map(prop => Nui.post('appearance_change_prop', prop)),
        outfit.hair ? Nui.post('appearance_change_hair', nextHair) : Promise.resolve(),
      ]);
    },
    [data, appearanceSettings, setData],
  );

  const isPedFreemodeModel = useMemo(() => {
    if (!data) return;

    return data.model === 'mp_m_freemode_01' || data.model === 'mp_f_freemode_01';
  }, [data]);

  const isPedMale = useMemo(() => {
    if(!data) return;

    if (data.model === 'mp_m_freemode_01') {
      return true;
    }

    return false
  }, [data]);

  const filterTattoos = (tattooSettings: TattoosSettings): TattoosSettings => {
    const filteredItems: TattoosSettings['items'] = {};
    for (const zone in tattooSettings.items) {
      filteredItems[zone] = tattooSettings.items[zone].filter(tattoo => {
        if (isPedMale) return tattoo.hashMale !== '';
        return tattoo.hashFemale !== '';
      });
    }
    return { ...tattooSettings, items: filteredItems };
  };

  const handleApplyTattoo = useCallback(
    async (tattoo: Tattoo, opacity: number) => {
      if (!data) return;
      tattoo.opacity = opacity;
      const { tattoos } = data;
      const updatedTattoos = JSON.parse(JSON.stringify({ ...tattoos}));
      if (!updatedTattoos[tattoo.zone]) updatedTattoos[tattoo.zone] = [];
      updatedTattoos[tattoo.zone].push(tattoo);
      const applied = await Nui.post('appearance_apply_tattoo', {tattoo, updatedTattoos});
      if(applied) {
        setData({ ...data, tattoos: updatedTattoos });
      }
    },
    [data, setData],
  );

  const handlePreviewTattoo = useCallback(
    (tattoo: Tattoo, opacity: number) => {
      if (!data) return;
      tattoo.opacity = opacity;
      const { tattoos } = data;
      Nui.post('appearance_preview_tattoo', { data: tattoos, tattoo });
    },
    [data],
  );

  const handleDeleteTattoo = useCallback(
    async (tattoo: Tattoo) => {
      if (!data) return;
      const { tattoos } = data;
      const updatedTattoos = JSON.parse(JSON.stringify(tattoos));
      updatedTattoos[tattoo.zone] = updatedTattoos[tattoo.zone].filter((tattooDelete: Tattoo) => tattooDelete.name !== tattoo.name);
      await Nui.post('appearance_delete_tattoo', updatedTattoos);
      setData({ ...data, tattoos: updatedTattoos });
    },
    [data, setData],
  );

  const handleClearTattoos = useCallback(
    async () => {
      if (!data) return;
      const { tattoos } = data;
      const updatedTattoos = { ...tattoos };
      for (var zone in updatedTattoos) {
        if (zone !== "ZONE_HAIR") {
          updatedTattoos[zone] = [];
        }
      }
      await Nui.post('appearance_delete_tattoo', updatedTattoos);
      setData({ ...data, tattoos: updatedTattoos });
    },
    [data, setData],
  );

  useEffect(() => {
    if(!locales) {
      Nui.post('appearance_get_locales').then(result => setLocales(result));
    }

    Nui.onEvent('appearance_display', (data : any) => {
      setDisplay({ appearance: true, asynchronous: data.asynchronous });
    });

    Nui.onEvent('appearance_hide', () => {
      setDisplay({ appearance: false, asynchronous: false });
      setData(APPEARANCE_INITIAL_STATE);
      setStoredData(APPEARANCE_INITIAL_STATE);
      //setAppearanceSettings(SETTINGS_INITIAL_STATE);
      setCameraPreset('default');
      setRotate(ROTATE_INITIAL_STATE);
    });
  }, []);

  const fetchData = useCallback(async () => {
    const result = await Nui.post('appearance_get_data');
    setConfig(result.config);
    setStoredData(result.appearanceData);
    setData(result.appearanceData); 
  }, []);

  const fetchSettings = useCallback(async () => {
    if(appearanceSettings === undefined || appearanceSettings === SETTINGS_INITIAL_STATE) {
      const result = await Nui.post('appearance_get_settings');
      setAppearanceSettings(result.appearanceSettings);
    }
  }, [appearanceSettings]);

  useEffect(() => {
    if (display.appearance) {
      if(display.asynchronous) {
        (async () => {
          await fetchSettings();
          await fetchData();
        })();
      } else {
        fetchSettings().catch(console.error);
        fetchData().catch(console.error);
      }
    }
  }, [display.appearance]);

  useEffect(() => {
    if (display.appearance) {
      Nui.post('appearance_turntable_start');
    } else {
      Nui.post('appearance_turntable_stop');
    }

    return () => {
      Nui.post('appearance_turntable_stop');
    };
  }, [display.appearance]);

  // ESC closes the menu (opens the exit modal first; second press dismisses it).
  // CEF receives ESC even though the game NUI focus is captured, so we just have
  // to intercept it here.
  useEffect(() => {
    if (!display.appearance) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      event.stopPropagation();

      if (saveModal) {
        setSaveModal(false);
        return;
      }

      if (exitModal) {
        setExitModal(false);
        return;
      }

      if (config?.enableExit) {
        setExitModal(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [display.appearance, saveModal, exitModal, config?.enableExit]);

  if (!display.appearance || !config || !appearanceSettings || !data || !storedData || !locales) {
    return null;
  }

  const showHero = config.components && config.props;
  const hasNonClothingPanels =
    config.ped ||
    (isPedFreemodeModel && config.headBlend) ||
    (isPedFreemodeModel && config.faceFeatures) ||
    config.headOverlays ||
    (isPedFreemodeModel && config.tattoos);

  return (
    <>
      {wrapperTransition.map(
        ({ item, key, props: style }) =>
          item && (
            <animated.div key={key} style={style}>
              <Wrapper>
                {hasNonClothingPanels && (
                <Container>
                  {config.ped && (
                    <Ped
                      settings={appearanceSettings.ped}
                      storedData={storedData.model}
                      data={data.model}
                      handleModelChange={handleModelChange}
                    />
                  )}
                  {appearanceSettings && (
                    <>
                      {isPedFreemodeModel && config.headBlend && (
                        <HeadBlend
                          settings={appearanceSettings.headBlend}
                          storedData={storedData.headBlend}
                          data={data.headBlend}
                          handleHeadBlendChange={handleHeadBlendChange}
                        />
                      )}
                      {isPedFreemodeModel && config.faceFeatures && (
                        <FaceFeatures
                          settings={appearanceSettings.faceFeatures}
                          storedData={storedData.faceFeatures}
                          data={data.faceFeatures}
                          handleFaceFeatureChange={handleFaceFeatureChange}
                        />
                      )}
                      {config.headOverlays && (
                        <HeadOverlays
                          settings={{
                            hair: appearanceSettings.hair,
                            headOverlays: appearanceSettings.headOverlays,
                            eyeColor: appearanceSettings.eyeColor,
                            fade: appearanceSettings.tattoos.items['ZONE_HAIR']
                          }}
                          storedData={{
                            hair: storedData.hair,
                            headOverlays: storedData.headOverlays,
                            eyeColor: storedData.eyeColor,
                            fade: storedData.tattoos?.ZONE_HAIR?.length > 0 ? storedData.tattoos.ZONE_HAIR[0] : null
                          }}
                          data={{
                            hair: data.hair,
                            headOverlays: data.headOverlays,
                            eyeColor: data.eyeColor,
                            fade: data.tattoos?.ZONE_HAIR?.length > 0 ? data.tattoos.ZONE_HAIR[0] : null
                          }}
                          isPedFreemodeModel={isPedFreemodeModel}
                          handleHairChange={handleHairChange}
                          handleHeadOverlayChange={handleHeadOverlayChange}
                          handleEyeColorChange={handleEyeColorChange}
                          handleChangeFade={handleChangeFade}
                          automaticFade={config.automaticFade}
                        />
                      )}
                    </>
                  )}
                  {isPedFreemodeModel && config.tattoos && (
                    <Tattoos
                      settings={filterTattoos(appearanceSettings.tattoos)}
                      data={data.tattoos}
                      storedData={storedData.tattoos}
                      handleApplyTattoo={handleApplyTattoo}
                      handlePreviewTattoo={handlePreviewTattoo}
                      handleDeleteTattoo={handleDeleteTattoo}
                      handleClearTattoos={handleClearTattoos}
                    />
                  )}
                </Container>
                )}
                {showHero && (
                  <ClothingHero
                    componentSettings={appearanceSettings.components}
                    propSettings={appearanceSettings.props}
                    hairSettings={appearanceSettings.hair}
                    data={data}
                    storedData={storedData}
                    componentConfig={config.componentConfig}
                    propConfig={config.propConfig}
                    hasTracker={config.hasTracker}
                    isPedFreemodeModel={isPedFreemodeModel}
                    handleComponentDrawableChange={handleComponentDrawableChange}
                    handleComponentTextureChange={handleComponentTextureChange}
                    handlePropDrawableChange={handlePropDrawableChange}
                    handlePropTextureChange={handlePropTextureChange}
                    handleHairChange={handleHairChange}
                    handleRandomize={handleRandomize}
                    handleApplyOutfit={handleApplyOutfit}
                    handleSave={handleSaveModal}
                    handleExit={handleExitModal}
                    enableExit={config.enableExit}
                    cameraPreset={cameraPreset}
                    onCameraPreset={handleSetCameraPreset}
                  />
                )}
                {!showHero && (
                  <Options
                    cameraPreset={cameraPreset}
                    rotate={rotate}
                    clothes={clothes}
                    handleSetClothes={handleSetClothes}
                    handleSetCameraPreset={handleSetCameraPreset}
                    handleTurnAround={handleTurnAround}
                    handleRotateLeft={handleRotateLeft}
                    handleRotateRight={handleRotateRight}
                    handleSave={handleSaveModal}
                    handleExit={handleExitModal}
                    enableExit={config.enableExit}
                  />
                )}
              </Wrapper>
              <AppearanceBrandCredit role="contentinfo">
                <span className="accent-w2f">W2F</span>
                <strong> · illenium-appearance</strong>
                <br />
                Original: snakewiz &amp; iLLeniumStudios
              </AppearanceBrandCredit>
            </animated.div>
          ),
      )}
      {saveModalTransition.map(
        ({ item, key, props: style }) =>
          item && (
            <animated.div key={key} style={style}>
              <Modal
                title={locales.modal.save.title}
                description={locales.modal.save.description}
                accept={locales.modal.accept}
                decline={locales.modal.decline}
                handleAccept={() => handleSave(true)}
                handleDecline={() => handleSave(false)}
              />
            </animated.div>
          ),
      )}
      {exitModalTransition.map(
        ({ item, key, props: style }) =>
          item && (
            <animated.div key={key} style={style}>
              <Modal
                title={locales.modal.exit.title}
                description={locales.modal.exit.description}
                accept={locales.modal.accept}
                decline={locales.modal.decline}
                handleAccept={() => handleExit(true)}
                handleDecline={() => handleExit(false)}
              />
            </animated.div>
          ),
      )}
    </>
  );
};

export default Appearance;
