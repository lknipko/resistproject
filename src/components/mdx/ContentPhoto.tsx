import Image from 'next/image'

interface ContentPhotoProps {
  src: string
  caption: string
  credit?: string
}

export function ContentPhoto({ src, caption, credit }: ContentPhotoProps) {
  return (
    <figure className="my-8 mx-auto max-w-[700px]">
      <div className="relative w-full overflow-hidden rounded shadow-md border border-gray-200">
        <Image
          src={src}
          alt={caption}
          width={700}
          height={467}
          style={{ width: '100%', height: 'auto' }}
          className="block"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
      <figcaption className="mt-2 text-center space-y-0.5">
        <p className="text-sm italic text-gray-600 leading-snug !ml-0">{caption}</p>
        {credit && (
          <p className="text-xs text-gray-400 leading-snug !ml-0">{credit}</p>
        )}
      </figcaption>
    </figure>
  )
}
