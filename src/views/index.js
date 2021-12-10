import ChangePwd from './ChangePwd';
import Class from './Class';
import Classroom from './Classroom';
import Func from './Func';
import RoleFunc from './RoleFunc';
import Student from './Student';
import UserRole from './UserRole';
import Staff from './Staff';

// export default {
//     ChangePwd,
//     Class,
//     Classroom,
//     Func,
//     RoleFunc,
//     Student,
//     UserRole,
//
// }
export default {
    ChangePwd: {
        component: ChangePwd,
        remark: '此组件可以完成密码修改',
    },
    Class: {
        component: Class,
        remark: '此组件可以完成班级管理',
    },
    Classroom: {
        component: Classroom,
        remark: '此组件可以完成教室管理',
    },
    Func: {
        component: Func,
        remark: '此组件可以完成系统功能管理',
    },
    RoleFunc: {
        component: RoleFunc,
        remark: '此组件可以完成角色功能分配',
    },
    Student: {
        component: Student,
        remark: '此组件可以完学生管理',
    },
    UserRole: {
        component: UserRole,
        remark: '此组件可以完成角色管理角色功能分配',
    },
    Staff: {
        component: Staff,
        remark: '此组件可以完成员工管理',
    }

}