import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import HomeComponent from "@/components/home";
import { getServerAuthSession } from "@/server/auth";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>{`OpenAI testing for UTCH <3`}</title>
        <link rel='icon' href='/mandra.jpg' />
      </Head>
      <HomeComponent />
    </>
  );
};


export default Home;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.id) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  };
};