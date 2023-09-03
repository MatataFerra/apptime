import React from "react";

import { GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import { createSwaggerSpec } from "next-swagger-doc";

import "swagger-ui-react/swagger-ui.css";

import swagger from "../../swagger.json";

const SwaggerUI = dynamic(import("swagger-ui-react"), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return <SwaggerUI spec={spec} />;
}

export async function getStaticProps() {
  const spec: Record<string, any> = createSwaggerSpec({
    apiFolder: "/src/pages/api",
    openApiVersion: 3,
    definition: swagger.definition,
  });

  return {
    props: {
      spec,
    },
  };
}

export default ApiDoc;
