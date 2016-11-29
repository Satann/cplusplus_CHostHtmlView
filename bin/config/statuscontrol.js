/**
* Configuration for status control in login dog
* 
*/
var StatusControl = {
	/**
	* Settings
	*
	*/
    retrylist: ["102","4202","4204","4016","4226","4218","4245","4249"],
    
    reqcomq: [],
    
    retrycount : 3, 
    
    botRetryInterval : 3000, // 3s
    
    mediacyList: ["101","4010","4011","4017","5010"],
    
    noReportList:["101"],
    
    keepStatusList:["200","603","504","4010","4011","4017","5010","50101"],

    /**
    * Utilities 
    *
    */
    
    addReqcom: function(reqobj){
        var newReqcom = new Object();
        newReqcom.reqobj = reqobj;
        newReqcom.retry = null;
        this.reqcomq.push(newReqcom);
        console.log(`* Add req to queue[${this.reqcomq.length}]`);
    },
    
    remReqcom: function(taskey){
        var testReqobj = this.getReqcom(taskey);
        if(testReqobj)
        {
            if((testReqobj.retry<=0)||(!testReqobj.retry))
            {
                this.reqcomq.splice(i, 1);
                console.log(`* Remove req ${testReqobj.reqobj.taskey} from queue`);
            }
            return -1;
        }
    },
    
    getReqcom: function(taskey){
        for (i = 0; i < this.reqcomq.length; i++){
            var testReqobj = this.reqcomq[i];
            if (testReqobj.reqobj.taskey == taskey){
                //console.log(`* Find testReqobj.reqobj: ${i}`);
                return testReqobj;
            }
        }
        return null;
    },
    
    retryDecrement: function(taskey){
        var testReqobj = this.getReqcom(taskey);
        if(testReqobj)
        {
            testReqobj.retry--;
            if(testReqobj.retry<=0)
            {
                console.log("* Find task ,cannot retry again");
                return false;
            }
            console.log("* Find task ,retry again");
            console.log(`* Remain retry count: ${testReqobj.retry}`);
            return true;
        }
        console.log("* Cann't find task");
        return false;
    },
    
    getRetry: function(taskey){
        var testReqobj = this.getReqcom(taskey);
        if(testReqobj)
        {
            return testReqobj.retry;
        }
        return -1;
    },
    
    setRetry: function(taskey,retry){
        var testReqobj = this.getReqcom(taskey);
        if(testReqobj)
        {
            testReqobj.retry = retry;
        }
        return -1;
    },
    
    ifRetry(Status){
        var str = this.retrylist.join();
        return str.indexOf(Status)!= -1;
    },
    
    isMediacy(Status){
        var str = this.mediacyList.join();
        return str.indexOf(Status)!= -1;
    },
    
    ifReport(Status){
        var str = this.noReportList.join();
        return str.indexOf(Status)== -1;
    },
    
    ifKeepStatus(Status){
        var str = this.keepStatusList.join();
        return str.indexOf(Status)!= -1;
    },
    dummy : ""
};
