const flag = (name: string) => import.meta.env[name] === 'true'

export const features = {
  mnemonic: flag('VITE_FEATURE_MNEMONIC'),
}
