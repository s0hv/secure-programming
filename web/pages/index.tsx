import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import { NavBar } from '@/components/NavBar';


export default function Home() {
  return (
    <>
      <Head>
        <title>App</title>
      </Head>
      <NavBar/>
      <main className={styles.main} />
    </>
  );
}
