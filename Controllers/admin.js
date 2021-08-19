
const displayDashboard = (req, res) => {

    let html = `
    <html>
        <body>
            <div>
                <div>
                    <h3>add New:</h3>
                    <div>
                        <div>
                            <span>Hotel: </span>
                        </div>
                        <div>
                            <form id='form'>
                                <label>hotel name :
                                    <input type="text" name="hotel" />
                                </label>
                                <label>hotel pms :
                                <select name="hotelpms"></select>
                                </label>
                                <input type="submit" value="ADD" />
                            </form>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span>Pms: </span>
                        </div>
                        <div>
                            <form>
                            
                                <label>Pms name :
                                <input type="text" name="pms" />
                                </label>
                                <label>Pms class :
                                <select name="pmsclass"></select>
                                </label>
                                <input type="submit" value="ADD" />
                            </form>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span>Pms Class: </span>
                        </div>
                        <div>
                            <form>
                            
                                <label>Pms Class name :
                                <input type="text" name="class" />
                                </label>
                                <label>Class definition :
                                <textarea name="classdefinition"></textarea>
                                </label>
                                <input type="submit" value="ADD" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </html>
`;

    return res.send(html);


} 

module.exports = { 
    displayDashboard
}
