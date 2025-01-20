import { receiptauth, submission, token, wbtip } from '../../../queries';
import { GlobaleaksSubmission } from '../../../types';

export class Globaleaks {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async report(body: GlobaleaksSubmission) {
    // console.log('Globaleaks report, call token from ', this.endpoint);
    let id = await token(this.endpoint);
    // console.log('Globaleaks report, received id ', id);

    // console.log('Globaleaks report, call receiptauth');
    id = await receiptauth(this.endpoint, id);
    // console.log('Globaleaks report, received id ', id);

    // console.log('Globaleaks report, call submission with ', body);
    const receipt = await submission(this.endpoint, id, body);
    // console.log('Globaleaks report, received receipt ', receipt);

    return receipt;
  }

  async show(reportCode: string) {
    // console.log('Globaleaks report, call token from ', this.endpoint);
    let id = await token(this.endpoint);
    // console.log('Globaleaks report, received id ', id);
    // console.log('Globaleaks report, call receiptauth, with ', reportCode);
    id = await receiptauth(this.endpoint, id, reportCode);
    // console.log('Globaleaks report, received id ', id);

    // console.log('Globaleaks report, call wbtip');
    const report = await wbtip(this.endpoint, id);
    // console.log('Globaleaks report received ', report);

    return report;
  }
}
