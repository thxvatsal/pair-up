import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { setDoc, onSnapshot } from 'firebase/firestore';

import {
  collection,
  doc,
  DocumentData,
  getDocs,
  limit,
  query,
  QueryDocumentSnapshot,
  where,
  deleteDoc,
} from '@firebase/firestore';
import Challenge from './Challenge';
import Quiz from './Quize';

const QuizHome = () => {
  const [isChallenged, setIsChallenged] = useState<Boolean>(false);
  const [loading, setLoading] = useState<Boolean>(true);
  const [input, setInput] = useState<String>('');
  const [doneChallenge, setDoneChallenge] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [studentName, setStudentName] = useState<String>('');
  const [challenges, setChallenges] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);
  const [gameStatusMesage, setGameStatusMessage] = useState<String>('');
  const [students, setStudents] = useState<
    QueryDocumentSnapshot<DocumentData>[]
  >([]);

  const challengesCollection = collection(firestore, 'challenges');
  const studentsCollection = collection(firestore, 'students');

  useEffect(() => {
    const ubsubscribed = onSnapshot(challengesCollection, (snapshot) => {
      setChallenges(
        // snapshot.docs.map((doc) => ({ id: doc.id, to: doc.data().to }))
        snapshot.docs.filter(
          (doc) =>
            doc.data().status == 'pending' && doc.data().to == studentName
        )
      );
      console.log('hello khan');
    });

    const ubsubscribedCompleted = onSnapshot(
      challengesCollection,
      (snapshot) => {
        setDoneChallenge(
          // snapshot.docs.map((doc) => ({ id: doc.id, to: doc.data().to }))
          snapshot.docs.filter(
            (doc) =>
              doc.data().status == 'done' && doc.data().from == studentName
          )
        );
        console.log('hello khan');
      }
    );

    return () => {
      ubsubscribed();
      ubsubscribedCompleted();
    };
  }, [studentName]);

  useEffect(() => {
    if (doneChallenge.length > 0) {
      doneChallenge.forEach((element) => {
        if (element.data().fromScore > element.data().toScore) {
          setGameStatusMessage('Congratulation you won');
        } else if (element.data().fromScore < element.data().toScore) {
          setGameStatusMessage('you loss');
        } else {
          setGameStatusMessage('score is level');
        }
      });
    }
  }, [doneChallenge]);

  useEffect(() => {
    if (challenges.length > 0) {
      setIsChallenged(true);
    }
  }, [challenges]);

  useEffect(() => {
    getFriends();
  }, []);

  const getFriends = async () => {
    const studentstQuery = query(
      studentsCollection,

      limit(10)
    );

    try {
      const querySnapshot = await getDocs(studentstQuery);
      const result: QueryDocumentSnapshot<DocumentData>[] = [];
      querySnapshot.forEach((snapshot) => {
        result.push(snapshot);
      });

      setStudents(result);
    } catch (error) {
      console.log(error);
    }
  };

  // const nameSubmit = (e) => {
  //   e.preventDefault();
  //   setStudentName(input);
  // };

  const closeChallenge = async (documentId: string) => {
    setGameStatusMessage('');
    console.log(documentId);
    // create a pointer to the document id
    const ch = doc(firestore, `challenges/${documentId}`);

    // delete the doc
    await deleteDoc(ch);
  };

  return (
    <div>
      {gameStatusMesage.length > 0 && (
        <div
          id="alert-border-1"
          class="flex p-4 mb-4 bg-blue-100 border-t-4 border-blue-500 dark:bg-blue-200"
          role="alert">
          <svg
            class="flex-shrink-0 w-5 h-5 text-blue-700"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"></path>
          </svg>

          <div class="ml-3 text-sm font-medium text-blue-700">
            {gameStatusMesage}
          </div>

          <button
            type="button"
            onClick={() => closeChallenge(doneChallenge[0].id)}
            class="ml-auto -mx-1.5 -my-1.5 bg-blue-100 dark:bg-blue-200 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 dark:hover:bg-blue-300 inline-flex h-8 w-8"
            data-dismiss-target="#alert-border-1"
            aria-label="Close">
            <span class="sr-only">Dismiss</span>
            <svg
              aria-hidden="true"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}

      {studentName ? (
        <div>
          <h1>Student name :{studentName}</h1>
          {isChallenged ? (
            <Challenge challenges={challenges} studentName={studentName} />
          ) : (
            <Quiz studentName={studentName} />
          )}
        </div>
      ) : (
        <div className="mt-10 font-bold text-center flex flex-col gap-y-2 w-1/2 m-auto">
          <h1>Select name</h1>
          <div className="flex flex-col gap-y-2">
            {students.map((student) => (
              <button
                onClick={(e) => setStudentName(student.data().name)}
                key={student.id}
                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                {student.data().name}
              </button>

              // <option key={student.id}>{student.data().name}</option>
            ))}
          </div>
        </div>

        // <form className="mt-10" onSubmit={nameSubmit}>
        //   <input
        //     onChange={(e) => setInput(e.target.value)}
        //     className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        //   />

        //   <input type="submit" />
        // </form>
      )}
    </div>
  );
};

export default QuizHome;
