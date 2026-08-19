import type { Thing, WithContext } from "schema-dts";

type StructuredDataProps = {
  data: Thing | WithContext<any> | Record<string, unknown> | Array<any>;
};

export function StructuredData({ data }: StructuredDataProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
