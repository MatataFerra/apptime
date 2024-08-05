interface EmailTemplateProps {
  firstName: string;
  url: string;
  locale: string;
  endpoint: string;
  token: string;
}

export function EmailTemplate({ firstName, url, locale, endpoint, token }: EmailTemplateProps) {
  return (
    <div>
      <h1>Hello, {firstName}!</h1>
      <p>
        You have requested reset your password for CasualApp, if you have not asked for a password{" "}
        <strong>please ignore this email and change your password</strong>
      </p>
      <p>
        Please click in the following link to change your password. The link will be able for a few
        hours
      </p>
      <a href={`${url}/${locale}/${endpoint}/${token}`}>
        <span>
          {url}/{locale}/{endpoint}/{token}
        </span>
      </a>
    </div>
  );
}
