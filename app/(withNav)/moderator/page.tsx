'use client'

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { report } from 'process';
import { useEffect, useState } from 'react';
import React from 'react';

interface Report {
  wordId: string;
  reason: string;
  optional?: string;
  date: string;
  userEmail: string;
}

interface WordDefinition {
  word: string;
  definition: string;
  exampleOfUsing: string;
  userEmail: string;
}

const Page = () => {
  const session = useSession();
  const [role, setRole] = useState<string>("user");
  const [reports, setReports] = useState<Report[]>([]);
  const [wordDefinitions, setWordDefinitions] = useState<{ [key: string]: WordDefinition[] }>({});

  async function getUserRole() {
    if (session.status === "authenticated") {
      try {
        const response = await fetch(`/api/contact?email=${session.data?.user?.email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setRole(res.role);
      } catch (error) {
        console.log(
          "There was a problem with the fetch operation: ", error
        );
      }
    }
  }

  useEffect(() => {
    getUserRole();
  }, [session]);

  async function getReports() {
    if (session.status === "authenticated") {
      try {
        const response = await fetch(`/api/report`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setReports(res);
  
        res.forEach((report: { wordId: string; }) => {
          if (report.wordId) {
            getWords(report.wordId);
          }
        });
      } catch (error) {
        console.log("There was a problem with the fetch operation: ", error);
      }
    }
  }
  
  async function getWords(id: string) {
    if (session.status === "authenticated") {
      try {
        const response = await fetch(`/api/definition?id=${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        
        setWordDefinitions((prevDefinitions) => ({
          ...prevDefinitions,
          [id]: res,
        }));
      } catch (error) {
        console.log("There was a problem with the fetch operation: ", error);
      }
    }
  }
  
  useEffect(() => {
    getReports();
  }, [role]);

  
  // console.log(wordDefinitions["669f6500726bd47197d177ba"][0].word);

  return (
    <>
      {(role !== "user") ? (
        <>
          <h1 className='mx-3 text-3xl font-bold'>Moderator, fii obiectiv ;-)</h1>
          <div className='flex justify-center min-h-[calc(100vh-200px)]'>
            <table className='mx-3 w-[100vw] h-fit'>
              <thead className='text-2xl'>
                <tr className=''>
                  <th className='m min-w-16'>Nr.</th>
                  <th>Cuvântul</th>
                  <th>Definiția</th>
                  <th>Exemplul</th>
                  <th>Autorul</th>
                  <th>Motivul</th>
                  <th>Opțional</th>
                  <th>Data</th>
                  <th>Trimis de</th>
                  <th>
                    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="25.1328" y="11.6001" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="23.1992" y="13.5336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="21.2676" y="13.5336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="19.334" y="13.5336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="17.4004" y="13.5336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="17.4004" y="15.4669" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="15.4668" y="17.4003" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="13.5332" y="19.3336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="11.5996" y="21.2671" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="9.66602" y="23.2004" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="7.73242" y="25.1338" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="5.80078" y="27.0671" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="3.86719" y="27.0671" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="1.93359" y="27.0671" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="3.86719" y="23.2004" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="15.4668" y="11.6001" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="27.0664" y="9.66687" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="27.0664" y="7.73352" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="27.0664" y="5.80017" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="25.1328" y="5.80017" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="23.1992" y="7.73352" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="21.2676" y="7.73352" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="19.334" y="5.80017" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="19.334" y="3.8667" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="21.2676" y="1.93335" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="21.2676" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="19.334" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="17.4004" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="15.4668" y="1.93335" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="13.5332" y="3.8667" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="13.5332" y="5.80017" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="13.5332" y="7.73352" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="13.5332" y="9.66687" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="11.5996" y="9.66687" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="9.66602" y="11.6001" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="7.73242" y="13.5336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="5.80078" y="15.4669" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="3.86719" y="17.4003" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect x="1.93359" y="19.3336" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect y="21.2671" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect y="23.2004" width="1.93337" height="1.93337" fill="#202020"/>
                      <rect y="25.1338" width="1.93337" height="1.93337" fill="#202020"/>
                    </svg>
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{wordDefinitions[report.wordId]?.[0]?.word || 'Loading...'}</td>
                    <td>{wordDefinitions[report.wordId]?.[0]?.definition || 'Loading...'}</td>
                    <td>{wordDefinitions[report.wordId]?.[0]?.exampleOfUsing || 'Loading...'}</td>
                    <td>{wordDefinitions[report.wordId]?.[0]?.userEmail || 'Loading...'}</td>
                    <td>{report["reason"]}</td>
                    <td>{report["optional"]}</td>
                    <td>{report["date"]}</td>
                    <td>{report["userEmail"]}</td>
                    <td>
                      <button>click</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className='h-[80vh] w-full flex justify-center items-center'>
          <h2 className='text-5xl'>Tu n-ar trebui să vezi asta. <Link href="/" className='underline text-blue-400'>Ieși</Link></h2>
        </div>
      )}
    </>
  )
}

export default Page;
