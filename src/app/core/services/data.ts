import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  orderBy,
  where,
  setDoc,
  updateDoc,
  getDocs,
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap } from 'rxjs';
import { User } from '@angular/fire/auth';
import { XUser } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore: Firestore = inject(Firestore);

  generateFirestoreId(collectionName: string): string {
    const collectionRef = collection(this.firestore, collectionName);
    return doc(collectionRef).id;
  }

  getUserProfile(uid: string): Observable<XUser | undefined> {
    const userDocRef = doc(this.firestore, `xUser/${uid}`);
    return docData(userDocRef) as Observable<XUser | undefined>;
  }

  async createUserProfile(user: User): Promise<void> {
    const userDocRef = doc(this.firestore, `xUser/${user.uid}`);
    const newUser: XUser = {
      xId: user.uid,
      xName: user.displayName || '',
      xEmail: user.email || '',
      xPhone: '',
      xPhoto: user.photoURL || undefined,
      xDirection: '',
      xStatus: 1,
      xUid: user.uid,
      xDisplayName: user.displayName,
      xPhotoURL: user.photoURL,
    };
    return setDoc(userDocRef, newUser);
  }

  updateUserProfile(uid: string, data: Partial<XUser>): Promise<void> {
    const userDocRef = doc(this.firestore, `xUser/${uid}`);
    return updateDoc(userDocRef, data);
  }

  getAllUsers(): Observable<XUser[]> {
    const usersCollection = collection(this.firestore, 'xUser');
    return collectionData(usersCollection, { idField: 'xId' }) as Observable<XUser[]>;
  }

  generatePetId(): string {
    return this.generateFirestoreId('xPet');
  }

  getAllPets(): Observable<any[]> {
    const petsCollection = collection(this.firestore, 'xPet');
    const q = query(petsCollection, orderBy('xCreatedAt', 'desc'));
    return collectionData(q, { idField: 'xId' }).pipe(
      map((pets) => {
        return pets;
      })
    ) as Observable<any[]>;
  }

  getUserPets(userId: string): Observable<any[]> {
    const petsCollection = collection(this.firestore, 'xPet');
    const q = query(petsCollection, orderBy('xCreatedAt', 'desc'));
    return collectionData(q, { idField: 'xId' }) as Observable<any[]>;
  }

  getPet(petId: string): Observable<any> {
    const petDoc = doc(this.firestore, `xPet/${petId}`);
    return docData(petDoc, { idField: 'xId' }) as Observable<any>;
  }

  async createPet(petData: any): Promise<void> {
    const petDocRef = doc(this.firestore, `xPet/${petData.xId}`);
    return setDoc(petDocRef, petData);
  }

  updatePet(petId: string, data: any): Promise<void> {
    const petDocRef = doc(this.firestore, `xPet/${petId}`);
    return updateDoc(petDocRef, data);
  }

  async deletePet(petId: string): Promise<void> {
    const petDocRef = doc(this.firestore, `xPet/${petId}`);
    return updateDoc(petDocRef, { xCurrentStatus: 5 });
  }

  generateReportId(): string {
    return this.generateFirestoreId('xReport');
  }

  getAllReports(): Observable<any[]> {
    const reportsCollection = collection(this.firestore, 'xReport');
    const q = query(reportsCollection, orderBy('xCreatedAt', 'desc'));
    return collectionData(q, { idField: 'xId' }).pipe(
      map((reports) => {
        return reports;
      })
    ) as Observable<any[]>;
  }

  getReport(reportId: string): Observable<any> {
    const reportDoc = doc(this.firestore, `xReport/${reportId}`);
    return docData(reportDoc, { idField: 'xId' }).pipe(
      switchMap(async (report) => {
        if (!report) return null;
        const expandedReport = await this.expandReportInfo(report);
        return expandedReport;
      })
    ) as Observable<any>;
  }

  getUserReports(userId: string): Observable<any[]> {
    const reportsCollection = collection(this.firestore, 'xReport');
    const q = query(reportsCollection, orderBy('xCreatedAt', 'desc'));
    return collectionData(q, { idField: 'xId' }).pipe(
      map((reports) =>
        reports
          .filter((report) => report['xIdUser'] === userId)
          .map((report) => this.expandReportInfo(report))
      )
    ) as Observable<any[]>;
  }

  async createReport(reportData: any): Promise<void> {
    const reportDocRef = doc(this.firestore, `xReport/${reportData.xId}`);
    return setDoc(reportDocRef, reportData);
  }

  updateReport(reportId: string, data: any): Promise<void> {
    const reportDocRef = doc(this.firestore, `xReport/${reportId}`);
    return updateDoc(reportDocRef, data);
  }

  private async expandReportInfo(report: any): Promise<any> {
    try {
      const petDoc = await getDocs(
        query(collection(this.firestore, 'xPet'), where('xId', '==', report.xIdPet))
      );

      const userDoc = await getDocs(
        query(collection(this.firestore, 'xUser'), where('xId', '==', report.xIdUser))
      );

      return {
        ...report,
        xPetInfo: petDoc.docs[0]?.data() || null,
        xUserInfo: userDoc.docs[0]?.data() || null,
      };
    } catch (error) {
      return report;
    }
  }

  getReportsStats(): Observable<any> {
    return this.getAllReports().pipe(
      map((reports) => {
        const total = reports.length;
        const active = reports.filter((r) => r.xStatus === 1).length;
        const resolved = reports.filter((r) => r.xStatus === 2).length;
        const withReward = reports.filter((r) => r.xRewardAmount > 0).length;

        return {
          total,
          active,
          resolved,
          withReward,
          lostPets: reports.filter((r) => r.xReportType === 1).length,
          foundPets: reports.filter((r) => r.xReportType === 2).length,
          adoptions: reports.filter((r) => r.xReportType === 3).length,
        };
      })
    );
  }
}
