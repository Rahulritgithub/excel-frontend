import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'https://excel-backend-4.onrender.com/process_logs';
  private pieChartUrl = 'https://excel-backend-4.onrender.com/get_piechart'; // Ensure this matches Flask
  private Url = 'https://excel-backend-4.onrender.com';


  constructor(private https: HttpClient) {}

  // Upload log files to the backend
  uploadLogs(files: File[]): Observable<Blob> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.https.post(this.apiUrl, formData, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  // Fetch pie chart data from the backend
  getPieChart(): Observable<Blob> {
    return this.https.get(this.pieChartUrl, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }
  listFiles(): Observable<string[]> {
    return this.https.get<string[]>(`${this.Url}/list-files`);
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}