import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogService } from '../log.service';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-log-parser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-parser.component.html',
  styleUrls: ['./log-parser.component.css']
})
export class LogParserComponent implements OnInit {
  excelData: { sheets: any[] } | null = null;
  fileList: File[] = [];
  Files: string[] = [];
  selectedFiles: File[] = [];
  chosenFiles: string = '';
  fileNames: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  chartUrls: { ECO: string | null, SPORT: string | null } = { ECO: null, SPORT: null };
  files: any[] = [];

  
  constructor(private logService: LogService, private http: HttpClient) {
  }

  refreshAll() {
    // Reset all variables
    this.selectedFiles = [];
    this.fileNames = '';
    this.errorMessage = '';
    this.isLoading = false;
    this.chartUrls = { ECO: null, SPORT: null };
    this.excelData = null;
    this.chosenFiles = '';
    this.Files = [];

    // Optionally, reload any dynamic data (e.g., file list)
    this.loadFileList();
  }
  

  ngOnInit(): void {
    if (this.selectedFiles.length > 0) {
      this.fetchPieChart(this.selectedFiles);
    }
  }
 
  loadFileList() {
      this.logService.listFiles().subscribe(
        (data: string[]) => {
          this.fileList = data.map(fileName => new File([], fileName)); // Assuming you have a fileList variable
        },
        (error: any) => {
          console.error('Error fetching file list:', error);
        }
      );
    }


  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    this.fileNames = this.selectedFiles.map(file => file.name).join(', ');
  }

  processLogs() {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Please select log files before processing.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.logService.uploadLogs(this.selectedFiles).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parsed_logs.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error processing logs. Ensure valid log formats are uploaded.';
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  




  fetchPieChart(files: File[]) {
    if (!files || files.length === 0) {
      console.error('No files selected');
      this.errorMessage = 'Please select log files before fetching the pie chart.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files', file));

    this.http.post<{ ECO: string, SPORT: string }>('http://localhost:5000/get_piechart', formData)
      .subscribe(
        response => {
          this.chartUrls = response;
          this.isLoading = false;
        },
        error => {
          console.error('Error fetching pie charts:', error);
          this.errorMessage = 'Error fetching pie charts. Please try again.';
          this.isLoading = false;
        }
      );
  }

  

  downloadCombinedImage() {
    // Check if at least one chart is available
    if (!this.chartUrls.ECO && !this.chartUrls.SPORT) {
      this.errorMessage = 'At least one chart is required to download.';
      return;
    }
  
    // Create a canvas to render the image(s)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      this.errorMessage = 'Failed to create canvas context.';
      return;
    }
  
    // If both images exist, combine them side by side
    if (this.chartUrls.ECO && this.chartUrls.SPORT) {
      const ecoImage = new Image();
      const sportImage = new Image();
      ecoImage.src = this.chartUrls.ECO;
      sportImage.src = this.chartUrls.SPORT;
  
      Promise.all([
        new Promise((resolve) => { ecoImage.onload = resolve; }),
        new Promise((resolve) => { sportImage.onload = resolve; })
      ]).then(() => {
        // Set canvas dimensions to fit both images side by side
        canvas.width = ecoImage.width + sportImage.width;
        canvas.height = Math.max(ecoImage.height, sportImage.height);
  
        // Draw ECO image on the left and SPORT image on the right
        ctx.drawImage(ecoImage, 0, 0);
        ctx.drawImage(sportImage, ecoImage.width, 0);
  
        // Download the combined image
        const combinedImageUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = combinedImageUrl;
        a.download = 'combined_charts.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }).catch((error) => {
        console.error('Error loading images:', error);
        this.errorMessage = 'Failed to load images for download.';
      });
    } else {
      // Only one image is available; determine which one.
      const imageUrl = this.chartUrls.ECO ? this.chartUrls.ECO : this.chartUrls.SPORT;
      if (!imageUrl) {
        this.errorMessage = 'No image URL available.';
        return;
      }
      const singleImage = new Image();
      singleImage.src = imageUrl;
      singleImage.onload = () => {
        // Set canvas dimensions to match the single image
        canvas.width = singleImage.width;
        canvas.height = singleImage.height;
        ctx.drawImage(singleImage, 0, 0);
        const combinedImageUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = combinedImageUrl;
        a.download = 'chart.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      singleImage.onerror = (error) => {
        console.error('Error loading image:', error);
        this.errorMessage = 'Failed to load image for download.';
      };
    }
  }
  
}



