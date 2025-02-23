import Head from "next/head"

interface MetaTagsProps {
  title: string
  description: string
  image: string
  url: string
}

export function MetaTags({ title, description, image, url }: MetaTagsProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph / Facebook / WhatsApp */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="HNWI Chronicles" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional WhatsApp specific */}
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:locale" content="en_US" />
    </Head>
  )
}

