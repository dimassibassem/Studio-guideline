import Image from 'next/image'


export function Logo() {
  return (
    <Image
      src={'/bankerise-logo.png'}
      alt={'Bankerise Logo'}
      width={150}
      height={50}
    />
  )
}
