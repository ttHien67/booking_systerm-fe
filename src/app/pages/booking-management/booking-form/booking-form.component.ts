import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from 'src/app/services/module/customer.service';
import { BookingFormModalComponent } from './booking-form-modal/booking-form-modal.component';
import { BookingService } from 'src/app/services/module/booking.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2'
import { CustomerModalComponent } from '../customer/customer-modal/customer-modal.component';
import { EmployeeService } from 'src/app/services/module/employee.service';
import { AuthService } from 'src/app/services/module/auth.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {

  form: any;
  listBooking: Array<any> = [] ;
  pageSize = 5;
  pageNumber = 1;
  totalSize: any;

  listProduct = [
    {
      id: 'a',
      name: "Create new account bank"
    },
    { 
      id: 'b',
      name: "Restore account bank"
    },
    { 
      id: 'c',
      name: "Money transfer"
    },
    { 
      id: 'd',
      name: "Block account bank"
    }
  ]

  listEmployee: any;

  today = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private bookingService: BookingService,
    private toastService: ToastrService,
    private employeeService: EmployeeService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getEmployee();

    if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
      this.getBookingOfEmployee();
    }else {
      this.getBookingList();
    }   
  }
  
  initForm () {
    this.form = this.formBuilder.group({
      name: [null],
      productType: [null],
      date:[null],
      employeeId: [null]
    })
  }

  get f () {
    return this.form.controls;
  }

  getBookingList() {
    const json = {
      name: this.f.name.value,
      productType: this.f.productType.value,
      date: this.f.date.value,
      employeeId: this.f.employeeId.value,
      limit: this.pageSize,
      page: this.pageNumber
    }
    this.bookingService.getBooking(json).subscribe(res => {
      if(res.errorCode === '0') {
        this.listBooking = res.data;
        this.totalSize = res.totalRecord;
      }
    })
  }

  getEmployee() {
    this.employeeService.getEmployee({}).subscribe(res => {
      if(res.errorCode === '0'){
        this.listEmployee = res.data;
      }
    })
  }

  getBookingOfEmployee(){
    const userId = this.authService.currentUser().userId;
    this.employeeService.getEmployee({accountId: userId}).subscribe(res => {
      if(res.errorCode === '0'){
        let employee = res.data;
        console.log(employee);
        
        this.f.employeeId.patchValue(employee[0]?.id);
        this.getBookingList();
      }
    })
  }

  openModal(item: any, type: any) {
    const modalRef = this.modalService.open(BookingFormModalComponent, {centered: true, size: 'lg', backdrop: 'static'});
    if(item) {
      modalRef.componentInstance.item = item;
    }
    modalRef.componentInstance.title = item ? "Edit" : "Create";
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.listEmployee = this.listEmployee;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry: any) => {
      this.modalService.dismissAll();
      if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
        this.getBookingOfEmployee();
      }else {
        this.getBookingList();
      }
    })
  }

  search() {
    if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
      this.getBookingOfEmployee();
    }else {
      this.getBookingList();
    }
  }

  refresh() {
    this.pageNumber = 1;
    this.pageSize = 5;
    this.initForm();
    if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
      this.getBookingOfEmployee();
    }else {
      this.getBookingList();
    }
  }

  changePageSize(event: any) {
    this.pageSize = event;
    if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
      this.getBookingOfEmployee();
    }else {
      this.getBookingList();
    }
  }

  changePage(event: any) {
    this.pageNumber = event;
    if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
      this.getBookingOfEmployee();
    }else {
      this.getBookingList();
    }
  }


  deleteBooking(item: any) {
    if (item) {
      Swal.fire({
        title: 'Warning!',
        text: 'Data is not restore after deleting',
        icon: 'error',
        confirmButtonText: 'OK',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancel',
      }).then((res) => {
        if (res.value) {
          const json = {
            // userId: this.authService.currentUser().userId,
            id: item.id,
          }
          this.bookingService.deleteBooking(json).subscribe(res => {
            if (res.errorCode === '0') {
              this.toastService.success(res.errorDesc);
              if(this.authService.currentUser().roleCode === 'EMPLOYEE'){
                this.getBookingOfEmployee();
              }else {
                this.getBookingList();
              }
            } else {
              this.toastService.error(res.errorDesc);
            }
          }, err => {
            this.toastService.error(err, 'Thông báo');
          });
        }
      })
      return;
    }

    this.refresh();
  }

}