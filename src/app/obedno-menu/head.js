const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '123456789012345';

export default function Head() {
  return <meta property="fb:app_id" content={facebookAppId} />;
}
